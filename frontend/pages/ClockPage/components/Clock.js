import React from "react";
import styled from "styled-components";
import Koji from "koji-tools";
import * as d3 from "d3";
import "./clock.css";

const Container = styled.div`
  width: ${({ width }) => width}px;
  margin: 0 auto;
  margin-bottom: 24px;
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
      handData: [
        {
          type: "hour",
          value: 0,
          length: 0,
          scale: hourScale
        },
        {
          type: "minute",
          value: 0,
          length: 0,
          scale: minuteScale
        },
        {
          type: "second",
          value: 0,
          length: 0,
          scale: secondScale,
          balance: 30
        }
      ],
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
    const { handData } = this.state;
    handData[0].value = (t.getHours() % 12) + t.getMinutes() / 60;
    handData[1].value = t.getMinutes();
    handData[2].value = t.getSeconds();
    this.setState({ handData });
  }

  moveHands() {
    console.log("move hands");
    const { handData } = this.state;
    d3.select("#clock-hands")
      .selectAll("line")
      .data(handData)
      .transition()
      .attr("transform", d => {
        return "rotate(" + d.scale(d.value) + ")";
      });
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
      secondTickLength = -10,
      hourTickStart = clockRadius,
      hourTickLength = -18,
      secondLabelRadius = clockRadius + 16,
      secondLabelYOffset = 5,
      hourLabelRadius = clockRadius - 40,
      hourLabelYOffset = 7;

    const { hourScale, minuteScale, secondScale, handData } = this.state;

    handData[0].length = -1 * hourHandLength;
    handData[1].length = -1 * minuteHandLength;
    handData[2].length = -1 * secondHandLength;

    const svg = d3
      .select("svg#clock")
      .attr("width", width)
      .attr("height", height);

    const face = svg
      .append("g")
      .attr("id", "clock-face")
      .attr(
        "transform",
        "translate(" +
          (clockRadius + margin) +
          "," +
          (clockRadius + margin) +
          ")"
      );

    // add marks for seconds
    face
      .selectAll(".second-tick")
      .data(d3.range(0, 60))
      .enter()
      .append("line")
      .attr("class", "second-tick")
      .attr("x1", 0)
      .attr("x2", 0)
      .attr("y1", secondTickStart)
      .attr("y2", secondTickStart + secondTickLength)
      .attr("transform", d => {
        return "rotate(" + secondScale(d) + ")";
      });
    //and labels

    face
      .selectAll(".second-label")
      .data(d3.range(5, 61, 5))
      .enter()
      .append("text")
      .attr("class", "second-label")
      .attr("text-anchor", "middle")
      .attr("x", d => {
        return secondLabelRadius * Math.sin(secondScale(d) * radians);
      })
      .attr("y", d => {
        return (
          -secondLabelRadius * Math.cos(secondScale(d) * radians) +
          secondLabelYOffset
        );
      })
      .text(d => {
        return d;
      });

    //... and hours
    face
      .selectAll(".hour-tick")
      .data(d3.range(0, 12))
      .enter()
      .append("line")
      .attr("class", "hour-tick")
      .attr("x1", 0)
      .attr("x2", 0)
      .attr("y1", hourTickStart)
      .attr("y2", hourTickStart + hourTickLength)
      .attr("transform", d => {
        return "rotate(" + hourScale(d) + ")";
      });

    face
      .selectAll(".hour-label")
      .data(d3.range(3, 13, 3))
      .enter()
      .append("text")
      .attr("class", "hour-label")
      .attr("text-anchor", "middle")
      .attr("x", d => {
        return hourLabelRadius * Math.sin(hourScale(d) * radians);
      })
      .attr("y", d => {
        return (
          -hourLabelRadius * Math.cos(hourScale(d) * radians) + hourLabelYOffset
        );
      })
      .text(d => {
        return d;
      });

    const hands = face.append("g").attr("id", "clock-hands");

    face
      .append("g")
      .attr("id", "face-overlay")
      .append("circle")
      .attr("class", "hands-cover")
      .attr("x", 0)
      .attr("y", 0)
      .attr("r", clockRadius / 20);

    hands
      .selectAll("line")
      .data(handData)
      .enter()
      .append("line")
      .attr("class", d => {
        return d.type + "-hand";
      })
      .attr("x1", 0)
      .attr("y1", d => {
        return d.balance ? d.balance : 0;
      })
      .attr("x2", 0)
      .attr("y2", d => {
        return d.length;
      })
      .attr("transform", d => {
        return "rotate(" + d.scale(d.value) + ")";
      });
  }

  render() {
    return (
      <Container width={320}>
        <svg id="clock" />
      </Container>
    );
  }
}

export default Clock;
