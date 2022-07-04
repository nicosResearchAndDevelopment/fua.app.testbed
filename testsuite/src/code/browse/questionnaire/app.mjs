import * as setup from './setup.mjs';

try {

    setup.form.addText({
        tag:   'h2',
        text:  'loading ...',
        class: 'grey-4'
    });

    const
        questionnaire = await setup.loadQuestionnaire(),
        answers       = setup.factory.dataset(),
        progress      = {
            done:       0,
            skipped:    0,
            maximum:    setup.extractObjects(questionnaire, setup.individuals.questionnaire,
                setup.properties.criteriaGroup, setup.properties.question).length,
            percentage: (digits = 2) => Math.round(100 * (10 ** digits) * (progress.done + progress.skipped) / progress.maximum) / (10 ** digits)
        };

    async function askQuestion(question) {
        // return if there is already data for this question
        if (answers.anyStatementMatching(question, null, null)) return;

        // ask any relevant question first or return if the relevant answer has not been given
        const relevantIfChoices = setup.extractObjects(questionnaire, question, setup.properties.relevantIf);
        for (let relevantIfChoice of relevantIfChoices) {
            const relevantQuestions = [
                ...setup.extractSubjects(questionnaire, relevantIfChoice, setup.properties.choice),
                ...setup.extractSubjects(questionnaire, relevantIfChoice, setup.properties.validChoice),
                ...setup.extractSubjects(questionnaire, relevantIfChoice, setup.properties.invalidChoice)
            ];
            for (let relevantQuestion of relevantQuestions) {
                if (!answers.anyStatementMatching(relevantQuestion, null, null))
                    await askQuestion(relevantQuestion);
                if (!answers.anyStatementMatching(relevantQuestion, setup.properties.answer, relevantIfChoice)) {
                    answers.add(question, setup.properties.skipped, setup.values.true);
                    progress.skipped += 1;
                    return;
                }
            }
        }

        setup.form.reset();

        const
            criteriaGroup       = setup.extractSubjects(questionnaire, question, setup.properties.question)
                .find(criteriaGroup => setup.types.CriteriaGroup.equals(questionnaire.any(criteriaGroup, setup.properties.type))),
            criteriaGroupLabel  = questionnaire.any(criteriaGroup, setup.properties.label, null)?.value || '',
            questionLabel       = questionnaire.any(question, setup.properties.label, null)?.value || '',
            questionDescription = questionnaire.any(question, setup.properties.description, null)?.value || '',
            questionType        = questionnaire.any(question, setup.properties.type, null)?.value
                .replace(setup.uris.ids3cm, '').replace('CheckListQuestion_', '') || '',
            checklistChoices    = [
                ...setup.extractObjects(questionnaire, question, setup.properties.choice),
                ...setup.extractObjects(questionnaire, question, setup.properties.validChoice),
                ...setup.extractObjects(questionnaire, question, setup.properties.invalidChoice)
            ].sort(() => Math.random() - .5),
            matrixColumns       = setup.extractObjects(questionnaire, question, setup.properties.matrixColumn);

        setup.form.addHTML(`
        <h3>
            <span class="grey-5">/</span>
            <span class="grey-4">${criteriaGroupLabel}</span>
            <span class="grey-5">/</span>
            <span class="grey-3">${questionLabel}</span>
            <span class="grey-5">-</span>
            <span class="grey-6">${progress.percentage()}%</span>
        </h3>
    `).addText({
            tag:  'h2',
            text: questionDescription
        });

        switch (questionType) {
            case 'CHECKBOX_EXCLUSIVE':
            case 'CHECKBOX_SINGLE':
            case 'CHECKBOX_MULTI':
                setup.form
                    .addCheckbox({
                        name:      'choice',
                        exclusive: questionType === 'CHECKBOX_EXCLUSIVE',
                        choices:   checklistChoices.map(choice => questionnaire.any(choice, setup.properties.label, null)?.value || '')
                    });
                break;
            case 'TEXT':
                setup.form
                    .addInput({
                        name:        'text',
                        placeholder: questionnaire.any(question, setup.properties.textPlaceholder, null)?.value || ''
                    });
                break;
            case 'MATRIX':
                // TODO display matrix questions
                // IDEA implement table input for the form gui
                return; // FIXME
                break;
            default:
                throw new Error('unexpected questionType ' + questionType);
        }

        await new Promise((resolve, reject) => setup.form.addButton({
            label: 'Submit',
            onClick() {
                try {
                    const result = this.getData();

                    switch (questionType) {
                        case 'CHECKBOX_EXCLUSIVE':
                            if (!result.choice) return; // TODO only for EXCLUSIVE or also for the others?
                        // REM no break here
                        case 'CHECKBOX_SINGLE':
                        case 'CHECKBOX_MULTI':
                            // TODO
                            break;
                        case 'TEXT':
                            // TODO
                            break;
                        case 'MATRIX':
                            // TODO
                            break;
                        default:
                            throw new Error('unexpected questionType ' + questionType);
                    }

                    // DEBUG FIXME remove
                    answers.add(question, setup.properties.skipped, setup.values.true);
                    resolve();

                    // TODO add the correct result to the answers
                } catch (err) {
                    reject(err);
                }
            }
        }));

        progress.done += 1;
    } // askQuestion

    const criteriaGroups = setup.extractObjects(questionnaire, setup.individuals.questionnaire, setup.properties.criteriaGroup);
    for (let criteriaGroup of criteriaGroups) {
        const criteriaQuestions = setup.extractObjects(questionnaire, criteriaGroup, setup.properties.question);
        for (let question of criteriaQuestions) {
            // if (progress.done < 5) // DEBUG
            await askQuestion(question);
        }
    }

    console.log('progress', progress);

    setup.form.reset().addText({
        tag:   'h2',
        text:  'submitting ...',
        class: 'grey-4'
    });

    await setup.submitAnswers(answers);

    setup.form.reset().addText({
        tag:   'h2',
        text:  'done!',
        class: 'grey-4'
    });

} catch (err) {

    setup.form.reset().addText({
        text:  '' + (err?.stack || err),
        class: 'error'
    });

} // try ... catch
