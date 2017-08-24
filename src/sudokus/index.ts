import {DIFFICULTY} from 'src/engine/utility';
import easySudokus from './easy';
import mediumSudokus from './medium';
import hardSudokus from './hard';
import evilSudokus from './evil';

function addIds<T>(array: T[]): Array<{id: number; value: T}> {
  return array.map((d, id) => {
    return {
      value: d,
      id,
    };
  });
}

export default {
  [DIFFICULTY.EASY]: addIds(easySudokus),
  [DIFFICULTY.MEDIUM]: addIds(mediumSudokus),
  [DIFFICULTY.HARD]: addIds(hardSudokus),
  [DIFFICULTY.EVIL]: addIds(evilSudokus),
};
