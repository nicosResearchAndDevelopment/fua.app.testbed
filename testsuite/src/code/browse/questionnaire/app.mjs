import * as setup from './setup.mjs';

const
    DEBUG               = true,
    DEBUG_MAX_QUESTIONS = 10;

try {

    setup.form.addText({
        tag:   'h2',
        text:  'loading ...',
        class: 'grey-4'
    });

    const
        questionnaire = await setup.loadQuestionnaire(),
        answers       = setup.factory.dataset(),
        answerSheet   = setup.namespace._base(),
        progress      = {
            done:       0,
            skipped:    0,
            maximum:    setup.extractObjects(questionnaire, setup.individuals.questionnaire,
                setup.properties.criteriaGroup, setup.properties.question).length,
            percentage: (digits = 2) => Math.round(100 * (10 ** digits) * (progress.done + progress.skipped) / progress.maximum) / (10 ** digits)
        };

    answers.add(answerSheet, setup.properties.type, setup.types.AnswerSheet);

    async function askQuestion(question) {
        // return if there is already data for this question
        if (answers.anyStatementMatching(question, null, null)) return;

        const answer = setup.namespace._base(question.value.replace(setup.uris.ids3c_co, ''));
        answers.add(answer, setup.properties.type, setup.types.Answer);
        answers.add(answer, setup.properties.question, question);
        answers.add(answerSheet, setup.properties.answer, answer);

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
            matrixColumns       = setup.extractObjects(questionnaire, question, setup.properties.matrixColumn),
            startedAtTime       = setup.factory.literal(new Date().toISOString(), setup.datatypes.dateTimeStamp);

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

        let
            onSubmit = null,
            onSkip   = function () {
                answers.add(answer, setup.properties.skipped, setup.values.true);
                return true;
            };

        switch (questionType) {

            case 'CHECKBOX_EXCLUSIVE':
            case 'CHECKBOX_SINGLE':
            case 'CHECKBOX_MULTI':
                setup.form.addCheckbox({
                    name:      'choice',
                    exclusive: questionType === 'CHECKBOX_EXCLUSIVE',
                    choices:   checklistChoices.map(choice =>
                        questionnaire.any(choice, setup.properties.label, null)?.value || choice.value || '')
                });
                onSubmit = function () {
                    const
                        result          = setup.form.getData(),
                        selectedChoices = (Array.isArray(result.choice) ? result.choice
                            : result.choice ? [result.choice] : [])
                            .map(strIndex => checklistChoices[parseInt(strIndex)]);

                    if (isMandatory && selectedChoices.length === 0) return false;
                    if (questionType === 'CHECKBOX_EXCLUSIVE' && selectedChoices.length === 0) return false;

                    answers.add(answer, setup.properties.skipped, setup.values.false);
                    for (let choice of selectedChoices) {
                        answers.add(answer, setup.properties.selectedChoice, choice);
                    }

                    return true;
                }; // onSubmit
                break;

            case 'TEXT':
                setup.form.addInput({
                    name:        'text',
                    placeholder: questionnaire.any(question, setup.properties.textPlaceholder, null)?.value || ''
                });
                onSubmit = function () {
                    const
                        result    = setup.form.getData(),
                        textValue = result.text || '';

                    if (isMandatory && !textValue) return false;

                    answers.add(answer, setup.properties.skipped, setup.values.false);
                    answers.add(answer, setup.properties.textValue, textValue);

                    return true;
                }; // onSubmit
                break;

            case 'MATRIX':
                // TODO display matrixColumns
                // IDEA implement table input for the form gui
                // TODO onSubmit
                break;

            default:
                throw new Error('unexpected questionType ' + questionType);

        } // switch

        await new Promise((resolve, reject) => {
            if (onSubmit) setup.form.addButton({
                label: 'Submit',
                onClick() {
                    try {
                        const submit = onSubmit();
                        if (!submit) return;
                        progress.done++;
                        resolve();
                    } catch (err) {
                        reject(err);
                    }
                } // onClick
            }); // .addButton

            if (!isMandatory || !onSubmit) setup.form.addButton({
                label: 'Skip',
                onClick() {
                    try {
                        const skip = onSkip();
                        if (!skip) return;
                        progress.skipped++;
                        resolve();
                    } catch (err) {
                        reject(err);
                    }
                } // onClick
            }); // .addButton
        });

        const
            endedAtTime = setup.factory.literal(new Date().toISOString(), setup.datatypes.dateTimeStamp),
            action      = setup.factory.blankNode();

        answers.add(answer, setup.properties.type, setup.types.Entity);
        answers.add(answer, setup.properties.wasGeneratedBy, action);
        answers.add(action, setup.properties.startedAtTime, startedAtTime);
        answers.add(action, setup.properties.endedAtTime, endedAtTime);

        setup.form.reset();
    } // askQuestion

    const criteriaGroups = setup.extractObjects(questionnaire, setup.individuals.questionnaire, setup.properties.criteriaGroup);
    mainLoop: for (let criteriaGroup of criteriaGroups) {
        const criteriaQuestions = setup.extractObjects(questionnaire, criteriaGroup, setup.properties.question);
        for (let question of criteriaQuestions) {
            if (DEBUG && (progress.done + progress.skipped) >= DEBUG_MAX_QUESTIONS)
                break mainLoop;
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
