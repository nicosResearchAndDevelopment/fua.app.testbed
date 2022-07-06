import {create} from '../lib/core.mjs';
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

        // const answer = setup.namespace._base(question.value.replace(setup.uris.ids3c_co, ''));
        // TODO add better random ID concept
        const answer = setup.namespace._base(question.value.replace(setup.uris.ids3c_co, '') + '#' + create.randomID());
        answers.add(answer, setup.properties.type, setup.types.Answer);
        answers.add(answer, setup.properties.question, question);

        // ask any relevant question first or return if the relevant answer has not been given
        const relevantIfChoices = setup.extractObjects(questionnaire, question, setup.properties.relevantIf);
        for (let relevantIfChoice of relevantIfChoices) {
            const relevantQuestions = [
                ...setup.extractSubjects(questionnaire, relevantIfChoice, setup.properties.choice),
                ...setup.extractSubjects(questionnaire, relevantIfChoice, setup.properties.validChoice),
                ...setup.extractSubjects(questionnaire, relevantIfChoice, setup.properties.invalidChoice)
            ];
            for (let relevantQuestion of relevantQuestions) {
                let relevantAnswer = answers.any(null, setup.properties.question, relevantQuestion);
                // if (!answers.anyStatementMatching(relevantQuestion, null, null)) {
                if (!relevantAnswer) {
                    await askQuestion(relevantQuestion);
                    relevantAnswer = answers.any(null, setup.properties.question, relevantQuestion);
                }
                // if (!answers.anyStatementMatching(relevantQuestion, setup.properties.answer, relevantIfChoice)) {
                if (!answers.anyStatementMatching(relevantAnswer, setup.properties.selectedChoice, relevantIfChoice)) {
                    answers.add(answer, setup.properties.skipped, setup.values.true);
                    progress.skipped += 1;
                    return;
                }
            }
        }

        const
            isMandatory         = !!questionnaire.anyStatementMatching(question, setup.properties.mandatory, setup.values.true),
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

        setup.form
            .reset()
            .addHTML(`<h3>
                <span class="grey-5">/</span>
                <span class="grey-4">${criteriaGroupLabel}</span>
                <span class="grey-5">/</span>
                <span class="grey-3">${questionLabel}</span>
                <span class="grey-5">-</span>
                <span class="grey-6">${progress.percentage()}%</span>
            </h3>`)
            .addText({
                tag:  'h2',
                text: questionDescription
            });

        switch (questionType) {
            case 'CHECKBOX_EXCLUSIVE':
            case 'CHECKBOX_SINGLE':
            case 'CHECKBOX_MULTI':
                await new Promise((resolve, reject) => {
                    setup.form
                        .addCheckbox({
                            name:      'choice',
                            exclusive: questionType === 'CHECKBOX_EXCLUSIVE',
                            choices:   checklistChoices.map(choice =>
                                questionnaire.any(choice, setup.properties.label, null)?.value || choice.value || '')
                        }) // .addCheckbox
                        .addButton({
                            label: 'Submit',
                            onClick() {
                                try {
                                    const
                                        result          = this.getData(),
                                        selectedChoices = (Array.isArray(result.choice) ? result.choice
                                            : result.choice ? [result.choice] : [])
                                            .map(strIndex => checklistChoices[parseInt(strIndex)]);

                                    if (isMandatory && selectedChoices.length === 0) return;
                                    if (questionType === 'CHECKBOX_EXCLUSIVE' && selectedChoices.length === 0) return;

                                    answers.add(answer, setup.properties.skipped, setup.values.false);
                                    for (let choice of selectedChoices) {
                                        answers.add(answer, setup.properties.selectedChoice, choice);
                                    }

                                    resolve();
                                } catch (err) {
                                    reject(err);
                                }
                            } // onClick
                        }); // .addButton
                    if (!isMandatory) setup.form.addButton({
                        label: 'Skip',
                        onClick() {
                            try {
                                answers.add(answer, setup.properties.skipped, setup.values.true);
                                resolve();
                            } catch (err) {
                                reject(err);
                            }
                        } // onClick
                    }); // .addButton
                }); // await new Promise
                break;
            case 'TEXT':
                await new Promise((resolve, reject) => {
                    setup.form
                        .addInput({
                            name:        'text',
                            placeholder: questionnaire.any(question, setup.properties.textPlaceholder, null)?.value || ''
                        }) // .addInput
                        .addButton({
                            label: 'Submit',
                            onClick() {
                                try {
                                    const
                                        result    = this.getData(),
                                        textValue = result.text || '';

                                    if (isMandatory && !textValue) return;

                                    answers.add(answer, setup.properties.skipped, setup.values.false);
                                    answers.add(answer, setup.properties.textValue, textValue);

                                    resolve();
                                } catch (err) {
                                    reject(err);
                                }
                            } // onClick
                        }); // .addButton
                    if (!isMandatory) setup.form.addButton({
                        label: 'Skip',
                        onClick() {
                            try {
                                answers.add(answer, setup.properties.skipped, setup.values.true);
                                resolve();
                            } catch (err) {
                                reject(err);
                            }
                        } // onClick
                    }); // .addButton
                }); // await new Promise
                break;
            case 'MATRIX':
                await new Promise((resolve, reject) => {
                    // TODO display matrixColumns
                    // IDEA implement table input for the form gui
                    setup.form
                        .addButton({
                            label: 'Submit',
                            onClick() {
                                try {
                                    const
                                        result = this.getData();

                                    // FIXME
                                    answers.add(answer, setup.properties.skipped, setup.values.true);

                                    resolve();
                                } catch (err) {
                                    reject(err);
                                }
                            } // onClick
                        }); // .addButton
                    if (!isMandatory) setup.form.addButton({
                        label: 'Skip',
                        onClick() {
                            try {
                                answers.add(answer, setup.properties.skipped, setup.values.true);
                                resolve();
                            } catch (err) {
                                reject(err);
                            }
                        } // onClick
                    }); // .addButton
                }); // await new Promise
                break;
            default:
                throw new Error('unexpected questionType ' + questionType);
        }

        const wasSkipped = !!answers.anyStatementMatching(answer, setup.properties.skipped, setup.values.true);
        if (wasSkipped) progress.skipped++; else progress.done++;
        setup.form.reset();
    } // askQuestion

    const criteriaGroups = setup.extractObjects(questionnaire, setup.individuals.questionnaire, setup.properties.criteriaGroup);
    for (let criteriaGroup of criteriaGroups) {
        const criteriaQuestions = setup.extractObjects(questionnaire, criteriaGroup, setup.properties.question);
        for (let question of criteriaQuestions) {
            if (progress.done < 10) // DEBUG
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
