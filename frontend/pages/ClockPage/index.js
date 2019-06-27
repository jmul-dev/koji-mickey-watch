import React from "react";
import styled, { ThemeProvider, keyframes } from "styled-components";
import { Helmet } from "react-helmet";
import { FaVolumeUp, FaVolumeMute } from "react-icons/fa";
import Koji from "koji-tools";

import Clock from "./components/Clock";

const Container = styled.div`
	display: flex;
	align-items: center;
	width: 100%;
	height: 100vh;
	background: url(${() => Koji.config.general.backgroundImage});
	background-size: cover;
	background-position: center;
	flex-direction: column;
	text-align: center;
`;

function getFontFamily(ff) {
	const start = ff.indexOf("family=");
	if (start === -1) return "sans-serif";
	let end = ff.indexOf("&", start);
	if (end === -1) end = undefined;
	return ff.slice(start + 7, end);
}

const Cover = styled.div`
	transition: opacity 0.7s ease-in-out;
	width: 100%;
	height: 100vh;
	position: absolute;
	top: 0;
	left: 0;
	background: linear-gradient(transparent 0, ${({ color }) => color});
	opacity: ${({ colorSwitch }) => (colorSwitch ? 1 : 0)};
`;

const Content = styled.div`
    width: 100%;
    height: 100vh;
    opacity: 1;
    z-index: 1;
    color: ${() => Koji.config.general.primaryColor};
    font-family: '${() => getFontFamily(Koji.config.general.fontFamily)}', sans-serif;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`;

const VolumeControl = styled.div`
	position: absolute;
	top: 6px;
	right: 6px;
	font-size: 14px;
	background-color: rgba(0, 0, 0, 0.6);
	border-radius: 6px;
	padding: 6px;
	display: flex;
	align-items: center;
	color: white;

	&:hover {
		background-color: rgba(0, 0, 0, 0.9);
	}
`;

const Title = styled.h1`
	font-size: 32px;
	margin: 0;
`;

class HomePage extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			color: "#fff",
			start: false,
			muted: localStorage.getItem("muted") === "true" || false
		};
	}

	componentDidMount() {
		Koji.on("change", () => {
			this.forceUpdate();
		});
	}

	flash(color) {
		this.setState({ color, colorSwitch: true });
		setTimeout(() => this.setState({ colorSwitch: false }), 700);
	}

	toggleMute(muted) {
		this.setState({ muted });
		localStorage.setItem("muted", muted);
	}

	render() {
		return (
			<Container color={this.state.color}>
				<Helmet defaultTitle={Koji.config.general.name}>
					<link href={Koji.config.general.fontFamily} rel="stylesheet" />
				</Helmet>
				<Cover color={this.state.color} colorSwitch={this.state.colorSwitch} />
				<Content>
					<VolumeControl>
						{this.state.muted ? (
							<FaVolumeMute onClick={() => this.toggleMute(false)} />
						) : (
							<FaVolumeUp onClick={() => this.toggleMute(true)} />
						)}
					</VolumeControl>
					<Title>{Koji.config.general.name}</Title>
					<Clock clockRadius={100} margin={40} muted={this.state.muted} />
				</Content>
			</Container>
		);
	}
}

export default HomePage;
