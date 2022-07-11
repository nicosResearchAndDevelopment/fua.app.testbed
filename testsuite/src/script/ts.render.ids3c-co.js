const
    path                   = require('path'),
    fs                     = require('fs/promises'),
    expect                 = require('expect'),
    __data                 = path.join(__dirname, '../../data'),
    util                   = require('../code/util.testsuite.js'),
    context                = require('@nrd/fua.resource.data/context'),
    rdf                    = require('@nrd/fua.module.rdf'),
    {Dataset, DataFactory} = require('@nrd/fua.module.persistence'),
    FilesystemStore        = require('@nrd/fua.module.persistence.filesystem'),
    {Space}                = require('@nrd/fua.module.space'),
    REPLACE                = false;

(async function Main() {

    const space = new Space({
        store: new FilesystemStore({
            defaultFile: 'file://ts.data.ttl',
            loadFiles:   [
                {
                    '@id':             'file://ts.data.ttl',
                    'dct:identifier':  path.join(__data, 'ts.data.ttl'),
                    'dct:format':      'text/turtle',
                    'dct:title':       'data.ttl',
                    'dct:alternative': 'Testsuite Data'
                },
                {
                    'dct:identifier':  path.join(__data, 'questionnaire/models/model.form.ttl'),
                    'dct:format':      'text/turtle',
                    'dct:title':       'model.form.ttl',
                    'dct:alternative': 'Form Ontology'
                },
                require('@nrd/fua.resource.ontology.ids/ids3cm'),
                require('@nrd/fua.resource.ontology.ids/ids3c-co')
            ]
        }, new DataFactory({
            ...context,
            'ids3cm':   'https://w3id.org/ids3cm/',
            'ids3c-co': 'https://w3id.org/ids3c-component/'
        }))
    });

    const ids_questionnaire = await loadQuestionnaire(space);
    expect(ids_questionnaire.size).toBeGreaterThan(0);

    try {
        const
            ttlContent   = await rdf.serializeDataset(ids_questionnaire, 'text/turtle'),
            filePath     = path.join(__data, 'questionnaire/ids3c-co.questionnaire.ttl'),
            writeOptions = REPLACE ? {flag: 'w'} : {flag: 'wx'};
        await fs.writeFile(filePath, ttlContent, writeOptions);
    } catch (err) {
        if (err.code !== 'EEXIST') throw err;
    }

    const nrd_questionnaire = new Dataset(null, ids_questionnaire.factory);

    util.logTodo('translate ids questionnaire to own model'); // TODO
    util.logSuccess();

})().catch(util.logError);

async function loadQuestionnaire(space) {
    const
        questionnaire = await space.getNode('ids3c-co:IDS_CheckListApproach_Questionnaire').load(),
        dataset       = questionnaire.dataset();

    for (let criteriaGroup of questionnaire.getNodes('ids3cm:criteriaGroup')) {
        await criteriaGroup.load();
        dataset.add(criteriaGroup.dataset());

        for (let question of criteriaGroup.getNodes('ids3cm:question')) {
            await question.load();
            dataset.add(question.dataset());

            for (let questionChoice of question.getNodes('ids3cm:validChoice')) {
                await questionChoice.load();
                dataset.add(questionChoice.dataset());
            }

            for (let questionChoice of question.getNodes('ids3cm:invalidChoice')) {
                await questionChoice.load();
                dataset.add(questionChoice.dataset());
            }

            for (let matrixColumn of question.getNodes('ids3cm:matrixColumn')) {
                await matrixColumn.load();
                dataset.add(matrixColumn.dataset());
            }
        }
    }

    return dataset;
} // loadQuestionnaire
