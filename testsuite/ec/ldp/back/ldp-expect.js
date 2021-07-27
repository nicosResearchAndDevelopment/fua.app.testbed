const
    util   = require('./ldp-util.js'),
    expect = module.exports = require('expect');

function createMessage(label, expected, received, value, hintFn, ...args) {
    return () => {
        const
            options      = {isNot: this.isNot, promise: this.promise},
            matcherHint  = this.utils.matcherHint(label, expected, received, options),
            expectedHint = hintFn.call(this, options.isNot, ...args),
            receivedHint = !value || util.isPrimitive(value) || value.__proto__.constructor === Object || value.__proto__.constructor === Array
                ? this.utils.printReceived(value)
                : value.__proto__.constructor.name;
        return matcherHint + '\n\nExpected: ' + expectedHint + '\nReceived: ' + receivedHint;
    };
}

const expectedHint = {
    notnull(isNot) {
        return (isNot ? '' : 'not ') + this.utils.printExpected(null) + ' or ' + this.utils.printExpected(undefined);
    },
    string(isNot) {
        return isNot ? 'not a string' : 'a string';
    },
    etag(isNot) {
        return isNot ? 'an invalid Entity Tag' : 'a valid Entity Tag';
    },
    statusCode(isNot, min, max) {
        if (!min) return isNot ? 'an invalid status code' : 'a valid status code';
        min = this.utils.printExpected(min);
        if (!max) return (isNot ? 'not a status code of ' : 'a status code of ') + min;
        max = this.utils.printExpected(max);
        return (isNot ? 'a status code outside ' : 'a status code inside ') + min + '-' + max;
    },
    include(isNot, expected) {
        return (isNot ? 'not to include ' : 'to include ') + this.utils.printExpected(expected);
    },
    link(isNot, relation, target) {
        relation = this.utils.printExpected(relation);
        if (!target) return (isNot ? 'not to contain' : 'to contain') + ' rel="${' + relation + '}"';
        target = this.utils.printExpected(target);
        return (isNot ? 'not to contain' : 'to contain') + ' "<${' + target + '}>; rel=\\"${' + relation + '}\\""';
    },
    dataset(isNot, subject, predicate, object) {
        if (subject || predicate || object) {
            const args = [subject, predicate, object]
                .map(val => util.isNull(val) ? 'null'
                    : val.termType ? val.termType + '<' + this.utils.printExpected(val.value) + '>'
                        : this.utils.printExpected(val));
            return (isNot ? 'a dataset not matching' : 'a dataset matching') + ' [ ' + args.join(', ') + ' ]';
        } else {
            return isNot ? 'an empty or no dataset' : 'a nonempty dataset';
        }
    }
};

expect.extend({
    toBeNotNull(value) {
        return {
            pass:    util.isNotNull(value),
            message: createMessage.call(this, 'toBeNotNull', 'value', '', value, expectedHint.notnull)
        };
    },
    toBeEntityTag(etag) {
        if (!util.isString(etag)) return {
            pass:    false,
            message: createMessage.call(this, 'toBeEntityTag', 'etag', '', etag, expectedHint.string)
        };
        return {
            pass:    util.pattern.ETag.test(etag),
            message: createMessage.call(this, 'toBeEntityTag', 'etag', '', etag, expectedHint.etag)
        };
    },
    toBeStatusCode(statusCode, min, max) {
        if (util.isArray(min)) [min, max] = min;
        const validType = util.isStatusCode(statusCode);
        if (!validType || !min) return {
            pass:    validType,
            message: createMessage.call(this, 'toBeStatusCode', 'statusCode', '', statusCode, expectedHint.statusCode)
        };
        if (!max || min === max) return {
            pass:    statusCode === min,
            message: createMessage.call(this, 'toBeStatusCode', 'statusCode', 'expected',
                statusCode, expectedHint.statusCode, min)
        };
        return {
            pass:    statusCode >= min && statusCode <= max,
            message: createMessage.call(this, 'toBeStatusCode', 'statusCode', 'min, max',
                statusCode, expectedHint.statusCode, min, max)
        };
    },
    toBeContentType(contentType, expected) {
        if (!util.isString(contentType)) return {
            pass:    false,
            message: createMessage.call(this, 'toBeContentType', 'contentType', '', contentType, expectedHint.string)
        };
        return {
            pass:    expected ? contentType.includes(expected) : util.pattern.nonempty.test(contentType),
            message: createMessage.call(this, 'toBeContentType', 'contentType', 'expected',
                contentType, expectedHint.include, expected)
        };
    },
    toContainLinkRelation(linkHeader, relation, target) {
        if (!util.isString(linkHeader)) return {
            pass:    false,
            message: createMessage.call(this, 'toContainLinkRelation', 'linkHeader', '',
                linkHeader, expectedHint.string)
        };
        const matchingRelation = Array.from(linkHeader.matchAll(util.matcher.Link)).filter(match => match[2] === relation);
        if (!matchingRelation.length || !target) return {
            pass:    matchingRelation.length > 0,
            message: createMessage.call(this, 'toContainLinkRelation', 'linkHeader', 'relation',
                linkHeader, expectedHint.link, relation)
        };
        const matchingTarget = matchingRelation.filter(match => match[1] === target);
        return {
            pass:    matchingTarget.length > 0,
            message: createMessage.call(this, 'toContainLinkRelation', 'linkHeader', 'relation, target',
                linkHeader, expectedHint.link, relation, target)
        };
    },
    toContainMatches(n3Store, subject, predicate, object) {
        if (!util.isFunction(n3Store?.countQuads)) return {
            pass:    false,
            message: createMessage.call(this, 'toContainMatches', 'n3Store', '', n3Store, expectedHint.dataset)
        };
        if (subject?.subject && subject?.predicate && subject?.object) {
            subject   = subject.subject;
            predicate = subject.predicate;
            object    = subject.object;
        }
        return {
            pass:    n3Store.countQuads(subject, predicate, object) > 0,
            message: createMessage.call(this, 'toContainMatches', 'n3Store', 'subject, predicate, object',
                n3Store, expectedHint.dataset, subject, predicate, object)
        };
    }
});