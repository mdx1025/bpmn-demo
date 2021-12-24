
import CustomContextPad from './CustomContextPad'
import PopupMenuModule from '../popup-menu';

export default {
    __depends__: [
        PopupMenuModule
      ],
    __init__: ['customContextPad'],
    customContextPad: ['type', CustomContextPad],
}
