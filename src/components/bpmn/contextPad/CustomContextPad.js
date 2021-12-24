// CustomContextPad.js
export default class CustomContextPad {
    constructor(config, contextPad, create, elementFactory, injector, translate,popupMenu) {
        this.create = create;
        this.elementFactory = elementFactory;
        this.translate = translate;
        this.popupMenu=popupMenu;
        if (config.autoPlace !== false) {
            this.autoPlace = injector.get('autoPlace', false);
        }

        contextPad.registerProvider(this); // 定义这是一个contextPad
    }

    // CustomContextPad.js
    getContextPadEntries(element) {
        const {
            autoPlace,
            create,
            elementFactory,
            translate,
            popupMenu
        } = this;
        console.log(popupMenu,999999999999)
        function appendTask(event, element) {
            if (autoPlace) {
                const shape = elementFactory.createShape({ type: 'bpmn:Task' });
                autoPlace.append(element, shape);
            } else {
                appendTaskStart(event, element);
            }
        }

        function appendTaskStart(event) {
            const shape = elementFactory.createShape({ type: 'bpmn:Task' });
            create.start(event, shape, element);
        }
        // if (!popupMenu.isEmpty(element, "bpmn-replace")) {
        //     // Replace menu entry
        //     assign(actions, {
        //       replace: {
        //         group: "edit",
        //         className: "bpmn-icon-screw-wrench",
        //         title: "Change type1111111111",
        //         action: {
        //           click: function(event, element) {
        //             var position = assign(getReplaceMenuPosition(element), {
        //               cursor: { x: event.x, y: event.y }
        //             });
        
        //             popupMenu.open(element, "bpmn-replace", position);
        //           }
        //         }
        //       }
        //     });
        //   }
        return {
            'append.lindaidai-task': {
                group: 'model',
                className: 'icon-custom lindaidai-task',
                title: translate('创建一个类型为lindaidai-task的任务节点'),
                action: {
                    click: appendTask,
                    dragstart: appendTaskStart
                }
            },
            'bpmn-replace':{
                group: "edit",
                className: "el-icon-wind-power",
                title: "Change type1111111111",
                action: {
                  click: function(event, element) {
                    // var position = assign(getReplaceMenuPosition(element), {
                    //   cursor: { x: event.x, y: event.y }
                    // });
                    console.log('点击--------')
                    popupMenu.open(element, "bpmn-replace", {cursor: { x: event.x, y: event.y }});
                  }
                }
              }
        };
    }

}

CustomContextPad.$inject = [
    'config',
    'contextPad',
    'create',
    'elementFactory',
    'injector',
    'translate',
    "popupMenu",
];
