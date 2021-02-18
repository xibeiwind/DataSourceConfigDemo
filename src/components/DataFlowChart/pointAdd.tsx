import {IPoint} from '../../models/applicationState';



export function pointIncrease(p1: IPoint, p2: IPoint): IPoint {
  return {x: p1.x + p2.x, y: p1.y + p2.y};
}

export function pointDecrease(p1: IPoint, p2: IPoint): IPoint {
  return {x: p1.x - p2.x, y: p1.y - p2.y};
}
