import {ISize} from "../models/applicationState";

export const constants: IConstantSettings = {
  circle: {
    normal: {
      r: 2,
      color: '#ffa500'
    },
    active: {
      r: 3,
      color: '#ffa500'
    }
  },
  line: {
    normal: {
      color: '#ffa500'
    },
    active: {
      color: '#ffa500'
    }
  },
  dataSource: {
    width: 200,
    field: {
      height: 30,
      controlPoint: {size: {w: 10, h: 10}}
    }
  }
};

interface ICircleConfig {
  r: number;
  color: string;
}
interface ILineConfig {
  color: string;
}

interface IConstantSettings {
  circle: {
    normal: ICircleConfig;
    active: ICircleConfig;
  };
  line: {
    normal: ILineConfig;
    active: ILineConfig;
  };
  dataSource: IDataSourceSettings;
}

interface IDataFieldSettings {

  height: number;
  controlPoint: {size: ISize};
}

interface IDataSourceSettings {
  width: number;

  field: IDataFieldSettings;

}


export function getPointConfig(isActive: boolean): ICircleConfig {
  const {normal, active} = constants.circle;
  return isActive ? active : normal;
}

export function getLineConfig(isActive: boolean): ILineConfig {
  const {normal, active} = constants.line;
  return isActive ? active : normal;
}

