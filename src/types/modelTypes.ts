
export interface ModelAttributes {
  gender: "Male" | "Female";
  bodyType: "Slim" | "Athletic" | "Curvy" | "Plus Size";
  age: "18-25" | "25-35" | "35-45" | "45+";
  ethnicity: "Asian" | "Black" | "Caucasian" | "Hispanic" | "Middle Eastern" | "Mixed";
  hairLength: "Short" | "Medium" | "Long";
  hairColor: "Black" | "Brown" | "Blonde" | "Red" | "Gray" | "Other";
  style: "authentic" | "amateur" | "polished" | "rock star" | "vogue";
}

export const attributeOptions: Record<keyof ModelAttributes, { label: string; value: string }[]> = {
  gender: [{
    label: "Female",
    value: "Female"
  }, {
    label: "Male",
    value: "Male"
  }],
  bodyType: [{
    label: "Slim",
    value: "Slim"
  }, {
    label: "Athletic",
    value: "Athletic"
  }, {
    label: "Curvy",
    value: "Curvy"
  }, {
    label: "Plus Size",
    value: "Plus Size"
  }],
  age: [{
    label: "18-25",
    value: "18-25"
  }, {
    label: "25-35",
    value: "25-35"
  }, {
    label: "35-45",
    value: "35-45"
  }, {
    label: "45+",
    value: "45+"
  }],
  ethnicity: [{
    label: "Asian",
    value: "Asian"
  }, {
    label: "Black",
    value: "Black"
  }, {
    label: "Caucasian",
    value: "Caucasian"
  }, {
    label: "Hispanic",
    value: "Hispanic"
  }, {
    label: "Middle Eastern",
    value: "Middle Eastern"
  }, {
    label: "Mixed",
    value: "Mixed"
  }],
  hairLength: [{
    label: "Short",
    value: "Short"
  }, {
    label: "Medium",
    value: "Medium"
  }, {
    label: "Long",
    value: "Long"
  }],
  hairColor: [{
    label: "Black",
    value: "Black"
  }, {
    label: "Brown",
    value: "Brown"
  }, {
    label: "Blonde",
    value: "Blonde"
  }, {
    label: "Red",
    value: "Red"
  }, {
    label: "Gray",
    value: "Gray"
  }, {
    label: "Other",
    value: "Other"
  }],
  style: [{
    label: "authentic",
    value: "authentic"
  }, {
    label: "amateur",
    value: "amateur"
  }, {
    label: "polished",
    value: "polished"
  }, {
    label: "rock star",
    value: "rock star"
  }, {
    label: "vogue",
    value: "vogue"
  }]
};

export const getRandomFromArray = <T extends unknown>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
};
