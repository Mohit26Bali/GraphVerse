export interface Viewport {
  width: number;
  height: number;
}

/** [min, max] in data space along one axis. */
export type Domain = [number, number];

export interface Scales {
  xScale: (x: number) => number;
  yScale: (y: number) => number;
  xInvert: (px: number) => number;
  yInvert: (px: number) => number;
  xDomain: Domain;
  yDomain: Domain;
}
