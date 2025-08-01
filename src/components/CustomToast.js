import Toast from 'react-native-root-toast'

const showToast = message =>
	Toast.show(message, {
		duration: Toast.durations.SHORT,
		position: Toast.positions.BOTTOM,
		shadow: true,
		animation: true,
		hideOnPress: true,
		delay: 0,
	})

export default showToast
