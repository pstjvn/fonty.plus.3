const KHMER_NAME = 'khmer';

/**
 * @typedef {{
 * family: string,
 * category: string,
 * subsets: Array<string>,
 * variants: Array<string>,
 * files: Object<string, string>,
 * label: string=,
 * isDefault: boolean=,
 * variant: string= 
 * }}
 */
export const FontRecord = null;

/**
 * Google's short to long weight name.
 * @const {Object<string, string>}
 */
const VariantToNameMap = {
  '100': 'Thin',
  '100italic': 'Thin Italic',
  '200': 'Extra-Light',
  '200italic': 'Extra-Light Italic',
  '300':  'Light',
  '300italic': 'Light Italic',
  'regular': 'Regular',
  'italic': 'Regular Italic',
  '500': 'Medium',
  '500italic': 'Medium Italic',
  '600': 'Semi-Bold',
  '600italic': 'Semi-Bold Italic',
  '700': 'Bold',
  '700italic': 'Bold Italic',
  '800': 'Exrta-Bold',
  '800italic': 'Extra-Bold Italic',
  '900': 'Black',
  '900italic': 'Black Italic'
}

/**
 * Given a variant, assumes we are looking for variant's weight to use
 * when calculating which is the default weight in list of variants.
 * 
 * @param {string} variant The variant as server by the Google API.
 * @return {number} The variant weight as number in order to be used in 
 * weigthing calcultions.
 */
function getRegularVariantWeight(variant) {
  if (variant === 'regular') return 400;
  // Make the italic too heavy as to be excluded automatically.
  if (variant.includes('italic')) return 10000; 
  return parseInt(variant, 10);
}

/**
 * Given a variant, assumes we are looking for variant's weight to use
 * when calculating which is the default weight in list of variants.
 * 
 * @param {string} variant The variant as server by the Google API.
 * @return {number} The variant weight as number in order to be used in 
 * weigthing calcultions.
 */
function getItalicVariantWeight(variant) {
  if (variant === 'italic') return 400;
  // Exclude non-italic variants by making them 'too heavy'.
  if (!variant.includes('italic')) return 10000;
  return parseInt(variant, 10);
}

/**
 * Given a list of variants of a font record returns the variant that is
 * closest to the desired median value. By default the median value used is the
 * regular (weight=400).
 * @param {Array<string>} list List of variants a font record supports.
 * @param {number} median The median to use to calculate closest value. Defaults
 * to 449 so in calculations it is the closest to regular 400.
 * @param {function(string): number} select_fn The function to use to calculate
 * the weight of each supported variant.
 * @param {number} opt_min_diff Optional minimum difference to use to
 * calculate initial required treshold to calculate the best match.
 */
function findClosestWeight(list, median = 449, select_fn, opt_min_diff) {
  let minDiff = opt_min_diff || 1000;
  let value = '';
  list.forEach(function(item) {
    let diff = Math.abs(select_fn(item) - median);
    if (diff <= minDiff) {
      minDiff = diff;
      value = item;
    }
  });
  return value || null;
}

/**
 * Given a Google font record, attempts to find a variant that would be 
 * considered the 'default' and would always be 'pre-loaded' when loading 
 * the font matching this font record. 
 * @param {FontRecord} record The font record as received from Google.
 * @return {string} The variant calculated as 'default' given the variants
 * available for this font record.
 */
function findDefaultVariant(record) {
  const variants = record.variants;
  return findClosestWeight(variants, undefined, getRegularVariantWeight) ||
    findClosestWeight(variants, undefined, getItalicVariantWeight) ||
    variants[0];
}

/**
 * Given a list of fonts, excludes the ones containing subset/language of
 * Khmer. 
 *
 * @param {Array<FontRecord>} list
 * @return {Array<FontRecord>}
 */
export function removeKhmer(list) {
  const initialCount = list.length;
  const result = list.filter(function(item) {
    if (item.subsets.includes(KHMER_NAME)) {
      if (item.subsets.length > 1) {
        console.warn(`Font record includes more than Khmer: ${item}`);
      }
      return false;
    }
    return true;
  });
  console.info(`Removed ${initialCount - result.length} fonts as Khmer`);
  return result;
}

/** 
 * Assumes the list has not been spread yet, remove the fonts that
 * have only italic variants.
 * @param {Array<FontRecord>} list
 * @return {Array<FontRecord>}
 */
export function removeItalics(list) {
  const result = [];
  list.filter(function(record) {
    if (record.variants.find(variant => !variant.includes('italic'))) {
      result.push(record);
    }
  });
  return result;
}

/**
 * Spreads the list of fonts into separate record for each variant.
 * @param {Array<FontRecord>} list The listing of font records to spread.
 * @param {boolean=} opt_allow_italic If we should include the italic fonts 
 * in the spread list. Off by default.
 * @return {Array<FontRecord>} The spreaded list.
 */
export function spreadList(list, opt_allow_italic) {
  const initialLength = list.length;
  const result = [];
  list.forEach(function(record) {
    // If there is a variant that is regular (i.e. non italic we will 
    // find it as default anyways).
    let defaultVariant = findDefaultVariant(record);
    record.variants.forEach(function(variant) {
      if (!opt_allow_italic && variant.includes('italic')) return;
      result.push({
        ...record,
        label: record.family + (VariantToNameMap[variant] ? 
            ' ' + VariantToNameMap[variant] : ''),
        variant: variant,
        isDefault: variant === defaultVariant,
        files: undefined,
        kind: undefined
      })
    });
  });
  console.info(`Bumped font list to ${result.length}, ` 
    + `increase ${(result.length / initialLength).toFixed(2)} times.`);
  return result;
}
