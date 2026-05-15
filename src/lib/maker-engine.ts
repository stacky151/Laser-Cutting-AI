import makerjs from 'makerjs';

export interface BoxConfig {
  width: number;
  depth: number;
  height: number;
  thickness: number;
  kerf: number;
  tabWidth: number;
}

/**
 * Generates a simple rectangular face with interlocking tabs on the edges.
 * For MVP, we will simulate the kerf compensation and path generation.
 */
class BoxFace implements makerjs.IModel {
  public paths: makerjs.IPathMap = {};
  public models: makerjs.IModelMap = {};

  constructor(width: number, height: number, tabWidth: number, kerf: number, isEdgePositive: boolean) {
    // A highly simplified representation of a tabbed edge for the MVP canvas visualization.
    // Real implementation requires complex boolean geometry for the tabs.
    
    // Base rectangle
    const rect = new makerjs.models.Rectangle(width, height);
    
    // Apply Kerf offset (expands the outer cut slightly so the fit is tight)
    // Kerf is the width of the laser beam. To compensate, we offset outwards by kerf / 2
    const offsetKerf = kerf / 2;
    
    // In a production app, we would use makerjs.model.outline or offset, 
    // but for this MVP visualization, we just scale the rectangle slightly.
    const scaledRect = makerjs.model.scale(rect, 1 + (offsetKerf / width));
    
    this.models = {
      outline: scaledRect
    };

    // Center the model
    makerjs.model.center(this);
  }
}

export function generateBoxSVG(config: BoxConfig): string {
  // Generate the 6 faces (Base, Top, Front, Back, Left, Right)
  // For the MVP preview, we will just lay them out flat.
  
  const front = new BoxFace(config.width, config.height, config.tabWidth, config.kerf, true);
  const back = new BoxFace(config.width, config.height, config.tabWidth, config.kerf, true);
  const left = new BoxFace(config.depth, config.height, config.tabWidth, config.kerf, false);
  const right = new BoxFace(config.depth, config.height, config.tabWidth, config.kerf, false);
  const bottom = new BoxFace(config.width, config.depth, config.tabWidth, config.kerf, true);
  
  // Arrange them in a flat layout
  front.origin = [0, 0];
  back.origin = [0, config.height + 10];
  left.origin = [-(config.depth + 10), 0];
  right.origin = [config.width + 10, 0];
  bottom.origin = [0, -(config.depth + 10)];

  const masterModel: makerjs.IModel = {
    models: {
      front,
      back,
      left,
      right,
      bottom
    }
  };

  // Export to SVG
  const svg = makerjs.exporter.toSVG(masterModel, {
    stroke: "red", // Cut layer is traditionally red in laser cutting
    strokeWidth: "1px",
    fill: "none",
    useSvgPathOnly: false,
    svgAttrs: {
      width: "100%",
      height: "100%",
      style: "max-height: 600px; max-width: 600px;"
    }
  });

  return svg;
}
