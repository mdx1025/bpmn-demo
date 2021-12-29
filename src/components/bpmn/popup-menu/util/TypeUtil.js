// import {
//   getBusinessObject
// } from '../../../util/ModelUtil';

// import {
//   isExpanded
// } from '../../../util/DiUtil';
function is(element, type) {
  var bo = getBusinessObject(element);

  return bo && (typeof bo.$instanceOf === 'function') && bo.$instanceOf(type);
}
function isExpanded(element) {

  if (is(element, 'bpmn:CallActivity')) {
    return false;
  }

  if (is(element, 'bpmn:SubProcess')) {
    return getBusinessObject(element).di && !!getBusinessObject(element).di.isExpanded;
  }

  if (is(element, 'bpmn:Participant')) {
    return !!getBusinessObject(element).processRef;
  }

  return true;
}
function getBusinessObject(element) {
  return (element && element.businessObject) || element;
}

/**
 * Returns true, if an element is from a different type
 * than a target definition. Takes into account the type,
 * event definition type and triggeredByEvent property.
 *
 * @param {djs.model.Base} element
 *
 * @return {boolean}
 */
export function isDifferentType(element) {

  return function(entry) {
    var target = entry.target;

    var businessObject = getBusinessObject(element),
        eventDefinition = businessObject.eventDefinitions && businessObject.eventDefinitions[0];

    var isTypeEqual = businessObject.$type === target.type;

    var isEventDefinitionEqual = (
      (eventDefinition && eventDefinition.$type) === target.eventDefinitionType
    );

    var isTriggeredByEventEqual = (
      businessObject.triggeredByEvent === target.triggeredByEvent
    );

    var isExpandedEqual = (
      target.isExpanded === undefined ||
      target.isExpanded === isExpanded(businessObject)
    );

    return !isTypeEqual || !isEventDefinitionEqual || !isTriggeredByEventEqual || !isExpandedEqual;
  };
}