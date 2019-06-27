import React from "react";
import styled from "styled-components";
import Koji from "koji-tools";
import * as d3 from "d3";
import "./clock.css";

const Container = styled.div`
	width: ${({ width }) => width}px;
	margin: 0 auto;
	margin-bottom: 24px;
	background: radial-gradient(#909090, #000000);
	border-radius: 72px;
`;

const Svg = styled.svg`
	stroke: ${() => Koji.config.style.textColor};
	background: url(${() => Koji.config.general.backgroundImage});
	background-size: 100px;
	background-position: center;
	background-repeat: no-repeat;
`;

class Clock extends React.Component {
	constructor(props) {
		super(props);

		const hourScale = d3
				.scaleLinear()
				.range([0, 330])
				.domain([0, 11]),
			minuteScale = d3
				.scaleLinear()
				.range([0, 354])
				.domain([0, 59]),
			secondScale = minuteScale;

		this.state = {
			hourScale,
			minuteScale,
			secondScale,
			hourHand: {
				type: "hour",
				value: 0,
				length: 0,
				angleAdjustment: -142,
				scale: hourScale,
				balance: 0,
				image: Koji.config.hands.hourHand
			},
			minuteHand: {
				type: "minute",
				value: 0,
				length: 0,
				angleAdjustment: -142,
				scale: minuteScale,
				balance: 0,
				image: Koji.config.hands.minuteHand
			},
			secondHand: {
				type: "second",
				value: 0,
				length: 0,
				angleAdjustment: 0,
				scale: secondScale,
				balance: 30
			},
			intervalId: null
		};
		this.updateData = this.updateData.bind(this);
		this.drawClock = this.drawClock.bind(this);
		this.moveHands = this.moveHands.bind(this);
	}

	componentDidMount() {
		this.drawClock();
		const intervalId = setInterval(() => {
			this.updateData();
			this.moveHands();
		}, 1000);
		this.setState({ intervalId });
	}

	componentWillUnmount() {
		clearInterval(this.state.intervalId);
	}

	updateData() {
		const t = new Date();
		const { hourHand, minuteHand, secondHand } = this.state;
		hourHand.value = (t.getHours() % 12) + t.getMinutes() / 60;
		minuteHand.value = t.getMinutes();
		secondHand.value = t.getSeconds();
		this.setState({ hourHand, minuteHand, secondHand });
	}

	moveHands() {
		const { hourHand, minuteHand, secondHand } = this.state;
		d3.select("#clock-hands")
			.selectAll("image")
			.data([hourHand, minuteHand])
			.transition()
			.attr("transform", (d) => "rotate(" + (d.scale(d.value) + d.angleAdjustment) + ")");

		d3.select("#clock-hands")
			.select("line")
			.data([secondHand])
			.transition()
			.attr("transform", (d) => "rotate(" + d.scale(d.value) + ")");
	}

	drawClock() {
		//create all the clock elements
		this.updateData(); //draw them in the correct starting position

		const { clockRadius, margin } = this.props;

		const radians = 0.0174532925,
			width = (clockRadius + margin) * 2,
			height = (clockRadius + margin) * 2,
			hourHandLength = (2 * clockRadius) / 3,
			minuteHandLength = clockRadius,
			secondHandLength = clockRadius - 12,
			secondHandBalance = 30,
			secondTickStart = clockRadius,
			secondTickLength = -6,
			hourTickStart = clockRadius,
			hourTickLength = -15,
			secondLabelRadius = clockRadius + 16,
			secondLabelYOffset = 5,
			hourLabelRadius = clockRadius - 40,
			hourLabelYOffset = 7;

		const { hourScale, minuteScale, secondScale, hourHand, minuteHand, secondHand } = this.state;

		hourHand.length = -hourHandLength;
		minuteHand.length = -minuteHandLength;
		secondHand.length = -secondHandLength;

		const svg = d3
			.select("svg#clock")
			.attr("width", width)
			.attr("height", height);

		const face = svg
			.append("g")
			.attr("id", "clock-face")
			.attr("transform", "translate(" + (clockRadius + margin) + "," + (clockRadius + margin) + ")");

		// add marks for seconds
		face.selectAll(".second-tick")
			.data(d3.range(0, 60))
			.enter()
			.append("line")
			.attr("class", "second-tick")
			.attr("x1", 0)
			.attr("x2", 0)
			.attr("y1", secondTickStart)
			.attr("y2", secondTickStart + secondTickLength)
			.attr("transform", (d) => "rotate(" + secondScale(d) + ")");
		//and labels

		face.selectAll(".second-label")
			.data(d3.range(5, 61, 5))
			.enter()
			.append("text")
			.attr("class", "second-label")
			.attr("text-anchor", "middle")
			.attr("x", (d) => secondLabelRadius * Math.sin(secondScale(d) * radians))
			.attr("y", (d) => -secondLabelRadius * Math.cos(secondScale(d) * radians) + secondLabelYOffset)
			.text((d) => d);

		//... and hours
		face.selectAll(".hour-tick")
			.data(d3.range(0, 12))
			.enter()
			.append("line")
			.attr("class", "hour-tick")
			.attr("x1", 0)
			.attr("x2", 0)
			.attr("y1", hourTickStart)
			.attr("y2", hourTickStart + hourTickLength)
			.attr("transform", (d) => "rotate(" + hourScale(d) + ")");

		face.selectAll(".hour-label")
			.data(d3.range(3, 13, 3))
			.enter()
			.append("text")
			.attr("class", "hour-label")
			.attr("text-anchor", "middle")
			.attr("x", (d) => hourLabelRadius * Math.sin(hourScale(d) * radians))
			.attr("y", (d) => -hourLabelRadius * Math.cos(hourScale(d) * radians) + hourLabelYOffset)
			.text((d) => d);

		const hands = face.append("g").attr("id", "clock-hands");

		face.append("g")
			.attr("id", "face-overlay")
			.append("circle")
			.attr("class", "hands-cover")
			.attr("x", 0)
			.attr("y", 0)
			.attr("r", clockRadius / 20);

		// Draw hourHand and minuteHand
		hands
			.selectAll("image")
			.data([hourHand, minuteHand])
			.enter()
			.append("image")
			.attr("xlink:href", (d) => d.image)
			.attr("class", (d) => d.type + "-hand")
			.attr("x1", 0)
			.attr("y1", (d) => d.balance)
			.attr("x2", 0)
			.attr("y2", (d) => d.length)
			.attr("transform", (d) => "rotate(" + (d.scale(d.value) + d.angleAdjustment) + ")");

		hands
			.data([secondHand])
			.append("line")
			.attr("class", (d) => d.type + "-hand")
			.attr("x1", 0)
			.attr("y1", (d) => d.balance)
			.attr("x2", 0)
			.attr("y2", (d) => d.length)
			.attr("transform", (d) => "rotate(" + (d.scale(d.value) + d.angleAdjustment) + ")");
	}

	render() {
		return (
			<Container width={320}>
				<Svg id="clock" />
			</Container>
		);
	}
}

export default Clock;
