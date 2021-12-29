// CustomPalette.js
export default class CustomPalette {
    constructor(bpmnFactory, create, elementFactory, palette, translate) {
        this.bpmnFactory = bpmnFactory;
        this.create = create;
        this.elementFactory = elementFactory;
        this.translate = translate;

        palette.registerProvider(this);
    }

    getPaletteEntries() {
        const {
            bpmnFactory,
            create,
            elementFactory,
            translate
        } = this;

        function createTask() {
            return function(event) {
                const businessObject = bpmnFactory.create('bpmn:Task1'); // 其实这个也可以不要
                const shape = elementFactory.createShape({
                    type: 'bpmn:Task1',
                    businessObject
                });
                console.log(shape) // 只在拖动或者点击时触发
                create.start(event, shape);
            }
        }
        function createStart() {
            return function(event) {
                const businessObject = bpmnFactory.create('bpmn:StartEvent'); // 其实这个也可以不要
                const shape = elementFactory.createShape({
                    type: 'bpmn:StartEvent',
                    businessObject
                });
                console.log(shape) // 只在拖动或者点击时触发
                create.start(event, shape);
            }
        }
        function createListener(type){
            return function(event) {
                const businessObject = bpmnFactory.create("bpmn:UserTask"); // 其实这个也可以不要
                const shape = elementFactory.createShape({
                    type: "bpmn:UserTask",
                    businessObject
                });
                console.log(shape) // 只在拖动或者点击时触发
                create.start(event, shape);
            }
        }
        
        return {
            'create.lindaidai-task': {
                group: 'model',
                className: 'icon-custom lindaidai-task',
                title: translate('创建一个类型为lindaidai-task的任务节点'),
                action: {
                    dragstart: createTask(),
                    click: createTask()
                }
            },
            'create.start1': {
                group: 'model',
                className: 'icon-custom el-icon-house',
                title: translate('创建一个类型为start1的起始'),
                action: {
                    dragstart: createStart(),
                    click: createStart()
                }
            },
            "create.user-task":{
                group: "activity",
                className: "bpmn-icon-user-task",
                title: translate("Create User Task"),
                action: {
                    dragstart: createListener(),
                    click: createListener()
                }
            }
        }
    }
}

CustomPalette.$inject = [
    'bpmnFactory',
    'create',
    'elementFactory',
    'palette',
    'translate'
]
