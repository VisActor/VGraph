import { AStarFinder } from "./astar";
import { Heuristic, IFinderOptions } from "./base";

export class BStarFinder extends AStarFinder {
  constructor(options?: IFinderOptions) {
    super(options ?? {});
  }
  getHeuristic() {
    const orig = Heuristic[this.heuristic!];
    return function (dx: number, dy: number) {
      return orig(dx, dy) * 1000000;
    };
  }
}
