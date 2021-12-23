// /parts/TitleProps.js
import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';

import { is } from 'bpmn-js/lib/util/ModelUtil';

export default function(group, element,translate) {
  if (is(element, 'bpmn:StartEvent')) { // 可以在这里做类型判断 如果不判断就是都展示
    let option = { id : 'title11', description : '权限的标题', label : '标题', modelProperty : 'title' };
    let option2 = { id : 'title22', description : '新字段', label : '另一个字段', modelProperty : 'newtitle' };
    let option1 = { id : 'select', description : '审批人列表', label : '审批人', modelProperty : 'select',selectOptions:[{value:1,name:'madx'}] };
    
    group.entries.push(entryFactory.textField(translate,option));
    group.entries.push(entryFactory.textField(translate,option2));

    // group.entries.push(entryFactory.selectBox(translate,option1));

    //下面写法有错误是因为textField方法需要传两个参数 但是下面只传了一个参数
    // group.entries.push(entryFactory.textField({
    //   id : 'title',
    //   description : '权限的标题',
    //   label : '标题',
    //   modelProperty : 'title'
    // }));
  }
}
