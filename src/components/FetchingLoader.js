import React from 'react'
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'

const FetchingLoader = props => (
	<View style={styles.modalContainer}>
		<View style={styles.modalContentContainer}>
			<ActivityIndicator size='large' color='#fff' />
			<Text style={styles.message}>{props.message}</Text>
		</View>
	</View>
)

export default FetchingLoader

const styles = StyleSheet.create({
	modalContainer: {
		position: 'absolute',
		top: 0,
		bottom: 0,
		left: 0,
		right: 0,
		backgroundColor: 'rgba(0,0,0,0.3)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	modalContentContainer: {
		width: '60%',
		height: 160,
		backgroundColor: 'rgba(0,0,0,0.6)',
		borderRadius: 20,
		justifyContent: 'center',
		alignItems: 'center',
	},
	message: {
		color: '#fff',
		fontSize: 12,
		marginTop: 8,
	},
})
