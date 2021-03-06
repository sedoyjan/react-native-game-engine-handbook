import React, { PureComponent } from "react";
import { StyleSheet, View, Text } from "react-native";
import { WebGLView } from "react-native-webgl";
import REGL from "regl";
import mat4 from "gl-mat4";
import bunny from "bunny";

class ReglView extends PureComponent {
  constructor() {
    super();
    this.state = {};
  }

  onContextCreate = gl => {
    const regl = REGL(gl);
    const rngl = gl.getExtension("RN");
    const clear = this.props.clearCommand(regl, rngl);
    const draw = this.props.drawCommand(regl, rngl);

    this.setState({
      frame: props => {
        clear(props);
        draw(props);
        rngl.endFrame();
      }
    });
  };

  render() {
    if (this.state.frame) this.state.frame(this.props);

    return (
      <WebGLView
        style={this.props.style}
        onContextCreate={this.onContextCreate}
      />
    );
  }
}

class Bunny extends PureComponent {
  drawCommand = regl => {
    return regl({
      vert: `
        precision mediump float;
        attribute vec3 position;
        uniform mat4 model, view, projection;
        void main() {
          gl_Position = projection * view * model * vec4(position, 1);
        }`,

      frag: `
        precision mediump float;
        void main() {
          gl_FragColor = vec4(1, 1, 1, 1);
        }`,

      // this converts the vertices of the mesh into the position attribute
      attributes: {
        position: bunny.positions
      },

      // and this converts the faces of the mesh into elements
      elements: bunny.cells,

      uniforms: {
        model: mat4.identity([]),
        view: (_, { angle }) => {
          return mat4.lookAt(
            [],
            [30 * Math.cos(angle), 2.5, 30 * Math.sin(angle)],
            [0, 2.5, 0],
            [0, 1, 0]
          );
        },
        projection: ({ viewportWidth, viewportHeight }) =>
          mat4.perspective(
            [],
            Math.PI / 4,
            viewportWidth / viewportHeight,
            0.01,
            1000
          )
      }
    });
  };

  clearCommand = regl => {
    return props => {
      regl.clear({
        depth: 1,
        color: [0, 0, 0, 1]
      });
    };
  };

  render() {
    return (
      <ReglView
        style={StyleSheet.absoluteFill}
        drawCommand={this.drawCommand}
        clearCommand={this.clearCommand}
        {...this.props}
      />
    );
  }
}

export { Bunny };
