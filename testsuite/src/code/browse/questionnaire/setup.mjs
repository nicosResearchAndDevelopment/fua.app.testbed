import rdflib from '../ext/rdflib-2.2.19.mjs';
import Form from '../lib/gui.form.mjs';

export const form = new Form(document.body, {
    onSubmit(event) {
        event.preventDefault();
    }
});

export const factory = {
    ...rdflib.DataFactory,
    ns(prefix) {
        return (suffix) => rdflib.sym(prefix + suffix);
    },
    dataset(quads) {
        const dataset = new rdflib.Store();
        if (quads) dataset.addAll(quads);
        return dataset;
    }
};

export const uris = {
    rdf:      'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    rdfs:     'http://www.w3.org/2000/01/rdf-schema#',
    dct:      'http://purl.org/dc/terms/',
    xsd:      'http://www.w3.org/2001/XMLSchema#',
    ids3cm:   'https://w3id.org/ids3cm/',
    ids3c_co: 'https://w3id.org/ids3c-component/'
};

export const namespace = {
    rdf:      factory.ns(uris.rdf),
    rdfs:     factory.ns(uris.rdfs),
    dct:      factory.ns(uris.dct),
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
    Question_CHECKBOX_EXCLUSIVE: namespace.ids3cm('CheckListQuestion_CHECKBOX_EXCLUSIVE'),
    Question_CHECKBOX_SINGLE:    namespace.ids3cm('CheckListQuestion_CHECKBOX_SINGLE'),
    Question_CHECKBOX_MULTI:     namespace.ids3cm('CheckListQuestion_CHECKBOX_MULTI'),
    QuestionChoice:              namespace.ids3cm('CheckListQuestionChoice'),
    Question_TEXT:               namespace.ids3cm('CheckListQuestion_TEXT'),
    Question_MATRIX:             namespace.ids3cm('CheckListQuestion_MATRIX'),
    MatrixColumn:                namespace.ids3cm('MatrixColumn')
};

export const properties = {
    type:          namespace.rdf('type'),
    label:         namespace.rdfs('label'),
    description:   namespace.dct('description'),
    criteriaGroup: namespace.ids3cm('criteriaGroup'),
    question:      namespace.ids3cm('question'),
    mandatory:     namespace.ids3cm('mandatory'),
    validChoice:   namespace.ids3cm('validChoice'),
    invalidChoice: namespace.ids3cm('invalidChoice')
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

export function extractObjects(dataset, subject, predicate, ...morePredicates) {
    const objects = dataset.match(subject, predicate, null)
        .map(quad => quad.object);
    if (morePredicates.length === 0) return objects;
    return objects
        .map(nextSubject => extractObjects(dataset, nextSubject, ...morePredicates))
        .flat(1);
} // extractObjects
