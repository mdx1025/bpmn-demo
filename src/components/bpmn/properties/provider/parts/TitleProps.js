// /parts/TitleProps.js
import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import cmdHelper from 'bpmn-js-properties-panel/lib/helper/CmdHelper';

import { is,getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

export default function(group, element,translate) {
  if (is(element, 'bpmn:StartEvent')) { // 可以在这里做类型判断 如果不判断就是都展示
    let option = { id : 'title11', description : '权限的标题', label : '标题', modelProperty : 'title' };
    let option2 = { id : 'title22', description : '新字段', label : '另一个字段', modelProperty : 'newtitle' };
    let option1 = { id : 'select', description : '审批人列表', label : '审批人', modelProperty : 'select',selectOptions:[{value:1,name:'madx'}] };
    
    group.entries.push(entryFactory.textField(translate,option));
    group.entries.push(entryFactory.textField(translate,option2));

    // group.entries.push(entryFactory.selectBox(translate,option1));
    group.entries.push(entryFactory.selectBox(translate, {
        id: 'form-key',
        label: '审批人',
        modelProperty: 'passSelect',
        // selectOptions: [
        //   { value: "one", name: "one" }, { value: "two", name: "two" }
        // ],
        selectOptions:[{value:1,name:'madx'},{value:2,name:'others'}],
        emptyParameter: false,
        get (element, node) {
          let bo = getBusinessObject(element);
          return {
            passSelect: bo.get('passSelect') ? bo.get('passSelect') : null,
          };
        },
        set (element, values, node) {
          console.log(element)
          return cmdHelper.updateBusinessObject(element, element.businessObject, {'passSelect' : values.passSelect || ''});
        },
      }));

    //下面写法有错误是因为textField方法需要传两个参数 但是下面只传了一个参数
    // group.entries.push(entryFactory.textField({
    //   id : 'title',
    //   description : '权限的标题',
    //   label : '标题',
    //   modelProperty : 'title'
    // }));
  }
}
