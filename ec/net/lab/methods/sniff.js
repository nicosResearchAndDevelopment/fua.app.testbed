const
    uuid               = require('@fua/core.uuid'),
    //
    id                 = "/tshark-sniff#", // TODO : better id
    version            = "0-0-1",
    {ExecutionProcess} = require('@fua/module.subprocess'),
    cmd_tshark         = ExecutionProcess('tshark', {encoding: 'utf-8'})
;

function randomLeave(pre) {
    return `${pre}${uuid.v1()}`;
}

async function fn_sniff(param) {

    let
        _id_   = "TODO",
        stub,
        _emit_ = null
    ; // let

    //region TEST
    if (_emit_)
        _emit_('event', /** error */ {'ge': "nau"}, /** data */ undefined);
    //endregion TEST

    const
        data   = {
            id:      `${randomLeave(id)}`,
            process: _id_,
            data:    {}
        },
        output = await cmd_tshark()
    ; // const

    if (_emit_)
        _emit_('event', /** error */ null, /** data */ data);

    Object.defineProperties(stub, {
        id:   {value: id, enumerable: true},
        kill: {
            value:         () => {
                return false;
            }, enumerable: true
        },
        emit: {
            set(emit) {
                _emit_ = emit;
            }, enumerable: false
        } // emit
    }); // Object.defineProperties(stub)

    Object.freeze(stub);
    return stub;

} // fn_sniff()

Object.defineProperties(fn_sniff, {
    id: {value: id, enumerable: true}
});

module.exports = fn_sniff;
