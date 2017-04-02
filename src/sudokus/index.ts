import {DIFFICULTY} from 'src/engine/utility';
import easySudokus from './easy';
import mediumSudokus from './medium';
import hardSudokus from './hard';
import evilSudokus from './evil';

export default {
    [DIFFICULTY.EASY]:   easySudokus,
    [DIFFICULTY.MEDIUM]: mediumSudokus,
    [DIFFICULTY.HARD]:   hardSudokus,
    [DIFFICULTY.EVIL]:   evilSudokus
};
