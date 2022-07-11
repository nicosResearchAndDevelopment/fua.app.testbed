const
    path           = require('path'),
    expect         = require('expect'),
    __root         = path.join(__dirname, '../..'),
    util           = require('../code/util.testsuite.js'),
    TestsuiteAgent = require('../code/agent.testsuite.js'),
    context        = require('@nrd/fua.resource.data/context'),
    rdf            = require('@nrd/fua.module.rdf'),
    {Dataset}      = require('@nrd/fua.module.persistence');

(async function Main() {

    const agent = await TestsuiteAgent.create({
        schema:   'https',
        hostname: 'testsuite.nicos-rd.com',
        port:     8081,
        context:  {
            ...context,
            'ids3cm':   'https://w3id.org/ids3cm/',
            'ids3c-co': 'https://w3id.org/ids3c-component/'
        },
        store:    {
            module:  '@nrd/fua.module.persistence.filesystem',
            options: {
                defaultFile: 'file://ts.data.ttl',
                loadFiles:   [
                    {
                        '@id':             'file://ts.data.ttl',
                        'dct:identifier':  path.join(__root, 'data/ts.data.ttl'),
                        'dct:format':      'text/turtle',
                        'dct:title':       'data.ttl',
                        'dct:alternative': 'Testsuite Data'
                    },
                    {
                        'dct:identifier':  path.join(__root, 'data/questionnaire/models/model.form.ttl'),
                        'dct:format':      'text/turtle',
                        'dct:title':       'model.form.ttl',
                        'dct:alternative': 'Form Ontology'
                    },
                    require('@nrd/fua.resource.ontology.ids/ids3cm'),
                    require('@nrd/fua.resource.ontology.ids/ids3c-co')
                ]
            }
        },
        prefix:   'ts',
        testbed:  {
            schema: 'https',
            host:   'testbed.nicos-rd.com',
            port:   8080
        }
    });

    expect(agent.space).toBeTruthy();

    const ids_questionnaire = await loadQuestionnaire(agent);
    expect(ids_questionnaire.size).toBeGreaterThan(0);

    const nrd_questionnaire = new Dataset(null, ids_questionnaire.factory);

    util.logTodo('translate ids questionnaire to own model'); // TODO
    util.logSuccess();

})().catch(util.logError);

async function loadQuestionnaire(agent) {
    const
        questionnaire = await agent.space.getNode('ids3c-co:IDS_CheckListApproach_Questionnaire').load(),
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
