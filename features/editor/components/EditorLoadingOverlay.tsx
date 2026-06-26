import { useEffect, useRef, useState } from 'react'
import { View, Animated, StyleSheet } from 'react-native'
import { useTheme } from '../../../shared/hooks/useTheme'
import { borderRadius } from '../../../shared/design/spacing'
import type { EditorBridge } from '@10play/tentap-editor'

/**
 * A loading overlay for the editor area.
 *
 * Subscribes to BridgeState updates via _subscribeToEditorStateUpdate
 * and hides once isReady is true. Falls back to a max wait of 8s.
 */
export function EditorLoadingOverlay({ editor }: { editor: EditorBridge }) {
  const { colors } = useTheme()
  const [loading, setLoading] = useState(true)
  const progressAnim = useRef(new Animated.Value(0)).current
  const mountedRef = useRef(true)
  const opacityAnim = useRef(new Animated.Value(1)).current

  // Animate progress bar from 0 to 0.85 (then jump to 1 when ready)
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: 0.85,
      duration: 6000,
      useNativeDriver: false,
    }).start()
  }, [progressAnim])

  // Subscribe to editor state updates to detect isReady
  useEffect(() => {
    // Timeout fallback: hide after 8s regardless
    const timeout = setTimeout(() => {
      if (mountedRef.current) {
        setLoading(false)
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }).start()
      }
    }, 8000)

    // Subscribe to bridge state changes
    if (editor.getEditorState()?.isReady) {
      setLoading(false)
      clearTimeout(timeout)
      return
    }

    const unsub = editor._subscribeToEditorStateUpdate?.(() => {
      if (editor.getEditorState()?.isReady && mountedRef.current) {
        setLoading(false)
        clearTimeout(timeout)
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }).start()
      }
    })

    return () => {
      mountedRef.current = false
      clearTimeout(timeout)
      unsub?.()
    }
  }, [editor, progressAnim, opacityAnim])

  if (!loading) return null

  const widthInterpolated = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  })

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          backgroundColor: colors.overlay,
          opacity: opacityAnim,
        },
      ]}
      pointerEvents="none"
    >
      <View style={[styles.progressTrack, { backgroundColor: colors.skeleton }]}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              backgroundColor: colors.accent.primary,
              width: widthInterpolated,
            },
          ]}
        />
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTrack: {
    width: '60%',
    height: 3,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
})
