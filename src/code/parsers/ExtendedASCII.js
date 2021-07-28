// SEE https://en.wikipedia.org/wiki/Extended_ASCII
// SEE http://www.fundraisersoftware.com/charmap.htm

// SEE https://github.com/jvilk/bfs-buffer/blob/2d7544c4aaeb683f009efa6dbef9e746270bda49/ts/extended_ascii.ts
//const extendedChars = [
//    '\u00C7', '\u00FC', '\u00E9', '\u00E2', '\u00E4',
//    '\u00E0', '\u00E5', '\u00E7', '\u00EA', '\u00EB', '\u00E8', '\u00EF',
//    '\u00EE', '\u00EC', '\u00C4', '\u00C5', '\u00C9', '\u00E6', '\u00C6',
//    '\u00F4', '\u00F6', '\u00F2', '\u00FB', '\u00F9', '\u00FF', '\u00D6',
//    '\u00DC', '\u00F8', '\u00A3', '\u00D8', '\u00D7', '\u0192', '\u00E1',
//    '\u00ED', '\u00F3', '\u00FA', '\u00F1', '\u00D1', '\u00AA', '\u00BA',
//    '\u00BF', '\u00AE', '\u00AC', '\u00BD', '\u00BC', '\u00A1', '\u00AB',
//    '\u00BB', '_', '_', '_', '\u00A6', '\u00A6', '\u00C1', '\u00C2', '\u00C0',
//    '\u00A9', '\u00A6', '\u00A6', '+', '+', '\u00A2', '\u00A5', '+', '+', '-',
//    '-', '+', '-', '+', '\u00E3', '\u00C3', '+', '+', '-', '-', '\u00A6', '-',
//    '+', '\u00A4', '\u00F0', '\u00D0', '\u00CA', '\u00CB', '\u00C8', 'i',
//    '\u00CD', '\u00CE', '\u00CF', '+', '+', '_', '_', '\u00A6', '\u00CC', '_',
//    '\u00D3', '\u00DF', '\u00D4', '\u00D2', '\u00F5', '\u00D5', '\u00B5',
//    '\u00FE', '\u00DE', '\u00DA', '\u00DB', '\u00D9', '\u00FD', '\u00DD',
//    '\u00AF', '\u00B4', '\u00AD', '\u00B1', '_', '\u00BE', '\u00B6', '\u00A7',
//    '\u00F7', '\u00B8', '\u00B0', '\u00A8', '\u00B7', '\u00B9', '\u00B3',
//    '\u00B2', '_', ' '
//];

// SEE https://theasciicode.com.ar/extended-ascii-code/non-breaking-space-no-break-space-ascii-code-255.html
const extendedChars = [
    'Ç', // ( Majuscule C-cedilla )
    'ü', // ( letter u with umlaut or diaeresis , u-umlaut )
    'é', // ( letter e with acute accent or e-acute )
    'â', // ( letter a with circumflex accent or a-circumflex )
    'ä', // ( letter a with umlaut or diaeresis , a-umlaut )
    'à', // ( letter a with grave accent )
    'å', // ( letter a with a ring )
    'ç', // ( Minuscule c-cedilla )
    'ê', // ( letter e with circumflex accent or e-circumflex )
    'ë', // ( letter e with umlaut or diaeresis ; e-umlauts )
    'è', // ( letter e with grave accent )
    'ï', // ( letter i with umlaut or diaeresis ; i-umlaut )
    'î', // ( letter i with circumflex accent or i-circumflex )
    'ì', // ( letter i with grave accent )
    'Ä', // ( letter A with umlaut or diaeresis ; A-umlaut )
    'Å', // ( Capital letter A with a ring )
    'É', // ( Capital letter E with acute accent or E-acute )
    'æ', // ( Latin diphthong ae in lowercase )
    'Æ', // ( Latin diphthong AE in uppercase )
    'ô', // ( letter o with circumflex accent or o-circumflex )
    'ö', // ( letter o with umlaut or diaeresis ; o-umlaut )
    'ò', // ( letter o with grave accent )
    'û', // ( letter u with circumflex accent or u-circumflex )
    'ù', // ( letter u with grave accent )
    'ÿ', // ( Lowercase letter y with diaeresis )
    'Ö', // ( Letter O with umlaut or diaeresis ; O-umlaut )
    'Ü', // ( Letter U with umlaut or diaeresis ; U-umlaut )
    'ø', // ( Lowercase slashed zero or empty set )
    '£', // ( Pound sign ; symbol for the pound sterling )
    'Ø', // ( Uppercase slashed zero or empty set )
    '×', // ( Multiplication sign )
    'ƒ', // ( Function sign ; f with hook sign ; florin sign )
    'á', // ( Lowercase letter a with acute accent or a-acute )
    'í', // ( Lowercase letter i with acute accent or i-acute )
    'ó', // ( Lowercase letter o with acute accent or o-acute )
    'ú', // ( Lowercase letter u with acute accent or u-acute )
    'ñ', // ( eñe, enie, spanish letter enye, lowercase n with tilde )
    'Ñ', // ( Spanish letter enye, uppercase N with tilde, EÑE, enie )
    'ª', // ( feminine ordinal indicator )
    'º', // ( masculine ordinal indicator )
    '¿', // ( Inverted question marks )
    '®', // ( Registered trademark symbol )
    '¬', // ( Logical negation symbol )
    '½', // ( One half )
    '¼', // ( Quarter, one fourth )
    '¡', // ( Inverted exclamation marks )
    '«', // ( Angle quotes, guillemets, right-pointing quotation mark )
    '»', // ( Guillemets, angle quotes, left-pointing quotation marks )
    '░', // ( Graphic character, low density dotted )
    '▒', // ( Graphic character, medium density dotted )
    '▓', // ( Graphic character, high density dotted )
    '│', // ( Box drawing character single vertical line )
    '┤', // ( Box drawing character single vertical and left line )
    'Á', // ( Capital letter A with acute accent or A-acute )
    'Â', // ( Letter A with circumflex accent or A-circumflex )
    'À', // ( Letter A with grave accent )
    '©', // ( Copyright symbol )
    '╣', // ( Box drawing character double line vertical and left )
    '║', // ( Box drawing character double vertical line )
    '╗', // ( Box drawing character double line upper right corner )
    '╝', // ( Box drawing character double line lower right corner )
    '¢', // ( Cent symbol )
    '¥', // ( YEN and YUAN sign )
    '┐', // ( Box drawing character single line upper right corner )
    '└', // ( Box drawing character single line lower left corner )
    '┴', // ( Box drawing character single line horizontal and up )
    '┬', // ( Box drawing character single line horizontal down )
    '├', // ( Box drawing character single line vertical and right )
    '─', // ( Box drawing character single horizontal line )
    '┼', // ( Box drawing character single line horizontal vertical )
    'ã', // ( Lowercase letter a with tilde or a-tilde )
    'Ã', // ( Capital letter A with tilde or A-tilde )
    '╚', // ( Box drawing character double line lower left corner )
    '╔', // ( Box drawing character double line upper left corner )
    '╩', // ( Box drawing character double line horizontal and up )
    '╦', // ( Box drawing character double line horizontal down )
    '╠', // ( Box drawing character double line vertical and right )
    '═', // ( Box drawing character double horizontal line )
    '╬', // ( Box drawing character double line horizontal vertical )
    '¤', // ( Generic currency sign )
    'ð', // ( Lowercase letter eth )
    'Ð', // ( Capital letter Eth )
    'Ê', // ( Letter E with circumflex accent or E-circumflex )
    'Ë', // ( Letter E with umlaut or diaeresis, E-umlaut )
    'È', // ( Capital letter E with grave accent )
    'ı', // ( Lowercase dot less i )
    'Í', // ( Capital letter I with acute accent or I-acute )
    'Î', // ( Letter I with circumflex accent or I-circumflex )
    'Ï', // ( Letter I with umlaut or diaeresis ; I-umlaut )
    '┘', // ( Box drawing character single line lower right corner )
    '┌', // ( Box drawing character single line upper left corner )
    '█', // ( Block, graphic character )
    '▄', // ( Bottom half block )
    '¦', // ( Vertical broken bar )
    'Ì', // ( Capital letter I with grave accent )
    '▀', // ( Top half block )
    'Ó', // ( Capital letter O with acute accent or O-acute )
    'ß', // ( Letter Eszett ; scharfes S or sharp S )
    'Ô', // ( Letter O with circumflex accent or O-circumflex )
    'Ò', // ( Capital letter O with grave accent )
    'õ', // ( Lowercase letter o with tilde or o-tilde )
    'Õ', // ( Capital letter O with tilde or O-tilde )
    'µ', // ( Lowercase letter Mu ; micro sign or micron )
    'þ', // ( Lowercase letter Thorn )
    'Þ', // ( Capital letter Thorn )
    'Ú', // ( Capital letter U with acute accent or U-acute )
    'Û', // ( Letter U with circumflex accent or U-circumflex )
    'Ù', // ( Capital letter U with grave accent )
    'ý', // ( Lowercase letter y with acute accent )
    'Ý', // ( Capital letter Y with acute accent )
    '¯', // ( Macron symbol )
    '´', // ( Acute accent )
    '≡', // ( Congruence relation symbol )
    '±', // ( Plus-minus sign )
    '‗', // ( underline or underscore )
    '¾', // ( three quarters, three-fourths )
    '¶', // ( Paragraph sign or pilcrow ; end paragraph mark )
    '§', // ( Section sign )
    '÷', // ( The division sign ; Obelus )
    '¸', // ( cedilla )
    '°', // ( Degree symbol )
    '¨', // ( Diaresis )
    '·', // ( Interpunct or space dot )
    '¹', // ( Superscript one, exponent 1, first power )
    '³', // ( Superscript three, exponent 3, cube, third power )
    '²', // ( Superscript two, exponent 2, square, second power )
    '■', // ( black square )
    ' ' // ( Non-breaking space or no-break space ) ( HTML entity = &nbsp; )
];

//const extendedCharCodes = extendedChars.map(char => char.charCodeAt(0));

const extendedCharCodes = [
    199, 252, 233, 226, 228, 224, 229, 231, 234, 235,
    232, 239, 238, 236, 196, 197, 201, 230, 198, 244,
    246, 242, 251, 249, 255, 214, 220, 248, 163, 216,
    215, 402, 225, 237, 243, 250, 241, 209, 170, 186,
    191, 174, 172, 189, 188, 161, 171, 187, 9617, 9618,
    9619, 9474, 9508, 193, 194, 192, 169, 9571, 9553, 9559,
    9565, 162, 165, 9488, 9492, 9524, 9516, 9500, 9472, 9532,
    227, 195, 9562, 9556, 9577, 9574, 9568, 9552, 9580, 164,
    240, 208, 202, 203, 200, 305, 205, 206, 207, 9496,
    9484, 9608, 9604, 166, 204, 9600, 211, 223, 212, 210,
    245, 213, 181, 254, 222, 218, 219, 217, 253, 221,
    175, 180, 8801, 177, 8215, 190, 182, 167, 247, 184,
    176, 168, 183, 185, 179, 178, 9632, 32
];

//const extendedChars = extendedCharCodes.map(charCode => String.fromCharCode(charCode));

/**
 * @param {string} str
 * @returns {Buffer}
 */
exports.str2byte = function (str) {
    const buf = Buffer.alloc(str.length);
    for (let i = 0; i < length; i++) {
        let charCode = str.charCodeAt(i);
        if (charCode > 0x7F) {
            const charIdx = extendedChars.indexOf(str.charAt(i));
            if (charIdx > -1) {
                charCode = charIdx + 0x80;
            }
        }
        buf.writeUInt8(charCode, i);
    }
    return length;
};

/**
 * @param {Buffer} buf
 * @returns {string}
 */
exports.byte2str = function (buf) {
    let str = '';
    for (let i = 0; i < buf.length; i++) {
        let charCode = buf.readUInt8(i);
        if (charCode > 0x7F) {
            charCode = extendedCharCodes[charCode - 128];
        }
        str += String.fromCharCode(charCode);
    }
    return str;
};