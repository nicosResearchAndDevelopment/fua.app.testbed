import {is, assert, create} from '../lib/core.mjs';
import rdflib from '../ext/rdflib-2.2.19.mjs';
import GUI from '../lib/gui.mjs';
import Form from '../lib/gui.form.mjs';
import Popup from '../lib/gui.popup.mjs';

GUI.style({
    'body, html': {
        'font-size': '20px'
    },
    '*':          {
        'font-family': 'monospace, sans-serif'
    }
});

export const popup = new Popup({
    'width':  '800px',
    'height': '600px',
    'title':  'Questionnaire'
});

popup.show();
window.addEventListener('resize', () => popup.show());

export const form = new Form(popup.content, {
    onSubmit(event) {
        event.preventDefault();
    }
});

form.style({
    '.grey-1': {color: '#202020'},
    '.grey-2': {color: '#404040'},
    '.grey-3': {color: '#606060'},
    '.grey-4': {color: '#808080'},
    '.grey-5': {color: '#9f9f9f'},
    '.grey-6': {color: '#bfbfbf'},
    '.grey-7': {color: '#dfdfdf'},
    '.error':  {color: '#ff0000'}
});

export const factory = {
    ...rdflib.DataFactory,
    ns(prefix = '') {
        return (suffix = '') => rdflib.sym(prefix + suffix);
    },
    dataset(quads) {
        const dataset = new rdflib.Store();
        if (quads) dataset.addAll(quads);
        return dataset;
    }
};

// TODO add better random ID concept
export const uris = {
    _base:    location.href + create.randomID() + '/',
    rdf:      'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    rdfs:     'http://www.w3.org/2000/01/rdf-schema#',
    dct:      'http://purl.org/dc/terms/',
    prov:     'http://www.w3.org/ns/prov#',
    xsd:      'http://www.w3.org/2001/XMLSchema#',
    ids3cm:   'https://w3id.org/ids3cm/',
    ids3c_co: 'https://w3id.org/ids3c-component/'
};

export const namespace = {
    _base:    factory.ns(uris._base),
    rdf:      factory.ns(uris.rdf),
    rdfs:     factory.ns(uris.rdfs),
    dct:      factory.ns(uris.dct),
    prov:     factory.ns(uris.prov),
    xsd:      factory.ns(uris.xsd),
    ids3cm:   factory.ns(uris.ids3cm),
    ids3c_co: factory.ns(uris.ids3c_co)
}; // namespace

export const individuals = {
    questionnaire: namespace.ids3c_co('IDS_CheckListApproach_Questionnaire')
}; // individuals

export const types = {
    Questionary:                 namespace.ids3cm('CheckListQuestionary'),
    CriteriaGroup:               namespace.ids3cm('CheckListCriteriaGroup'),
    Question:                    namespace.ids3cm('CheckListQuestion'),
    AnswerSheet:                 namespace.ids3cm('CheckListAnswerSheet'),
    Answer:                      namespace.ids3cm('CheckListAnswer'),
    Question_CHECKBOX_EXCLUSIVE: namespace.ids3cm('CheckListQuestion_CHECKBOX_EXCLUSIVE'),
    Question_CHECKBOX_SINGLE:    namespace.ids3cm('CheckListQuestion_CHECKBOX_SINGLE'),
    Question_CHECKBOX_MULTI:     namespace.ids3cm('CheckListQuestion_CHECKBOX_MULTI'),
    QuestionChoice:              namespace.ids3cm('CheckListQuestionChoice'),
    Question_TEXT:               namespace.ids3cm('CheckListQuestion_TEXT'),
    Question_MATRIX:             namespace.ids3cm('CheckListQuestion_MATRIX'),
    MatrixColumn:                namespace.ids3cm('MatrixColumn'),
    MatrixRow:                   namespace.ids3cm('MatrixRow'),
    MatrixAnswer:                namespace.ids3cm('MatrixAnswer'),
    Entity:                      namespace.prov('Entity'),
    Activity:                    namespace.prov('Activity')
};

export const datatypes = {
    string:        namespace.prov('string'),
    dateTime:      namespace.prov('dateTime'),
    dateTimeStamp: namespace.prov('dateTimeStamp')
};

export const properties = {
    type:              namespace.rdf('type'),
    label:             namespace.rdfs('label'),
    description:       namespace.dct('description'),
    criteriaGroup:     namespace.ids3cm('criteriaGroup'),
    question:          namespace.ids3cm('question'),
    mandatory:         namespace.ids3cm('mandatory'),
    choice:            namespace.ids3cm('choice'),
    validChoice:       namespace.ids3cm('validChoice'),
    invalidChoice:     namespace.ids3cm('invalidChoice'),
    relevantIf:        namespace.ids3cm('relevantIf'),
    answer:            namespace.ids3cm('answer'),
    matrixColumn:      namespace.ids3cm('matrixColumn'),
    matrixRow:         namespace.ids3cm('matrixRow'),
    matrixAnswer:      namespace.ids3cm('matrixAnswer'),
    matrixTopicText:   namespace.ids3cm('matrixTopicText'),
    textPlaceholder:   namespace.ids3cm('textPlaceholder'),
    skipped:           namespace.ids3cm('skipped'),
    selectedChoice:    namespace.ids3cm('selectedChoice'),
    textValue:         namespace.ids3cm('textValue'),
    wasAttributedTo:   namespace.prov('wasAttributedTo'),
    wasGeneratedBy:    namespace.prov('wasGeneratedBy'),
    used:              namespace.prov('used'),
    wasAssociatedWith: namespace.prov('wasAssociatedWith'),
    startedAtTime:     namespace.prov('startedAtTime'),
    endedAtTime:       namespace.prov('endedAtTime')
}; // properties

export const values = {
    true:  factory.literal('true', namespace.xsd('boolean')),
    false: factory.literal('false', namespace.xsd('boolean'))
};

export async function loadQuestionnaire() {
    const
        baseURI     = location.href,
        contentType = 'application/ld+json',
        response    = await fetch('questionnaire', {headers: {'Accept': contentType}}),
        payload     = await response.text(),
        dataset     = factory.dataset();

    await new Promise((resolve, reject) => rdflib.parse(
        payload,
        dataset,
        baseURI,
        contentType,
        (err, result) => err ? reject(err) : resolve(result)
    ));

    return dataset;
} // loadQuestionnaire

export async function submitAnswers(answers) {
    const
        baseURI     = location.href,
        contentType = 'application/ld+json',
        payload     = await new Promise((resolve, reject) => rdflib.serialize(
            null,
            answers,
            baseURI,
            contentType,
            (err, result) => err ? reject(err) : resolve(result)
        ));

    // console.log(JSON.parse(payload));
    // TODO submit answers
    const request = await fetch('answers', {method: 'POST', headers: {'Content-Type': contentType}, body: payload});
    assert(request.ok, `[${request.status}] ${request.statusText}`);
} // submitAnswers

export function extractObjects(dataset, subject, predicate, ...morePredicates) {
    const objects = dataset.match(subject, predicate, null)
        .map(quad => quad.object);
    if (morePredicates.length === 0) return objects;
    return objects
        .map(nextSubject => extractObjects(dataset, nextSubject, ...morePredicates))
        .flat(1);
} // extractObjects

export function extractSubjects(dataset, object, predicate, ...morePredicates) {
    const subjects = dataset.match(null, predicate, object)
        .map(quad => quad.subject);
    if (morePredicates.length === 0) return subjects;
    return subjects
        .map(prevObject => extractObjects(dataset, prevObject, ...morePredicates))
        .flat(1);
} // extractSubjects
