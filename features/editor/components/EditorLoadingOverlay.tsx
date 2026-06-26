import { useEffect, useRef, useState } from 'react'
import { View, Animated, StyleSheet, Text } from 'react-native'
import { useTheme } from '../../../shared/hooks/useTheme'
import { typography } from '../../../shared/design/typography'
import { spacing, borderRadius } from '../../../shared/design/spacing'
import type { EditorBridge } from '@10play/tentap-editor'

/**
 * Loading overlay for the rich-text editor.
 *
 * Shows a pulsing skeleton block with a progress bar underneath,
 * matching the app's design language. Hides automatically when
 * the editor signals isReady, or falls back after 8s.
 */
export function EditorLoadingOverlay({ editor }: { editor: EditorBridge }) {
  const { colors, isDark } = useTheme()
  const [visible, setVisible] = useState(true)
  const progressAnim = useRef(new Animated.Value(0)).current
  const fadeAnim = useRef(new Animated.Value(1)).current
  const pulseAnim = useRef(new Animated.Value(1)).current
  const mountedRef = useRef(true)
  const hiddenRef = useRef(false)

  // Animate progress bar from 0 → 0.9 over 6s
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: 0.9,
      duration: 6000,
      useNativeDriver: false,
    }).start()
  }, [progressAnim])

  // Subtle pulse animation for the skeleton block
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.6,
          duration: 800,
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: false,
        }),
      ]),
    )
    pulse.start()
    return () => pulse.stop()
  }, [pulseAnim])

  // Subscribe to editor ready state or fallback after 8s
  useEffect(() => {
    mountedRef.current = true

    const timeout = setTimeout(() => {
      if (mountedRef.current) hideOverlay()
    }, 8000)

    if (editor.getEditorState()?.isReady) {
      clearTimeout(timeout)
      hideOverlay()
      return
    }

    const unsub = editor._subscribeToEditorStateUpdate?.(() => {
      if (editor.getEditorState()?.isReady && mountedRef.current) {
        clearTimeout(timeout)
        hideOverlay()
      }
    })

    return () => {
      mountedRef.current = false
      clearTimeout(timeout)
      unsub?.()
    }
  }, [editor])

  function hideOverlay() {
    if (hiddenRef.current) return
    hiddenRef.current = true
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      if (mountedRef.current) setVisible(false)
    })
  }

  if (!visible) return null

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  })

  const bgColor = isDark ? colors.surface : colors.background

  return (
    <Animated.View
      style={[styles.wrapper, { backgroundColor: bgColor, opacity: fadeAnim }]}
      pointerEvents="box-none"
    >
      <View style={styles.inner}>
        {/* Skeleton blocks simulating editor content */}
        <Animated.View
          style={[
            styles.skeletonBlock,
            { backgroundColor: colors.skeleton, opacity: pulseAnim },
          ]}
        />
        <Animated.View
          style={[
            styles.skeletonBlock,
            styles.skeletonShort,
            { backgroundColor: colors.skeleton, opacity: pulseAnim },
          ]}
        />
        <Animated.View
          style={[
            styles.skeletonBlock,
            styles.skeletonMedium,
            { backgroundColor: colors.skeleton, opacity: pulseAnim },
          ]}
        />

        {/* Progress bar */}
        <View style={[styles.progressTrack, { backgroundColor: colors.borderLight }]}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                backgroundColor: colors.accent.primary,
                width: progressWidth,
              },
            ]}
          />
        </View>

        {/* Loading label */}
        <Text style={[styles.label, { color: colors.text.tertiary }]}>
          Carregando editor...
        </Text>
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
    borderRadius: borderRadius.md,
  },
  inner: {
    width: '75%',
    alignItems: 'center',
    gap: spacing.sm,
  },
  skeletonBlock: {
    width: '100%',
    height: 14,
    borderRadius: borderRadius.sm,
  },
  skeletonShort: {
    width: '60%',
    alignSelf: 'flex-start',
  },
  skeletonMedium: {
    width: '80%',
    alignSelf: 'flex-start',
  },
  progressTrack: {
    width: '100%',
    height: 3,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginTop: spacing.md,
  },
  progressBar: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  label: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    marginTop: spacing.xs,
  },
})
