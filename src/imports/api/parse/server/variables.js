export const date_regex = /^\d{1,2}[.\/-]\d{1,2}[.\/-]\d{4}$/;

export const invalidValues = [
  "(Invalid Identifier)",
  "1/0/1900",
  " ",
  "",
  0,
  "#N/A",
  "(Invalid Date)",
  ";",
];

invalidKeys = [
  "LegalName",
  "TotalInvestmentsAndSubsidiaries",
  "TotalCoInvestors",
  "TotalDirectInvestments"
];

default_page_data = {
  nombreCompletoDeLaPersona: "",
  sexo:"",
  fechaDeNacimiento: "",
  nacionalidad: "",
  foto: "",
  tipoDeDireccion: "",
  ciudad:"",
  estadoOProvincia: "",
  pais: "",
  region: "",
  name: "",
  title: ""
}

razon_social_valida = [
  "ab",
  "ag",
  "aktiengesellschaft",
  "a/s",
  "asa",
  "etf",
  "inc",
  "incorporated",
  "lp",
  "ltd",
  "nv",
  "plc",
  "sa",
  "saa",
  "sab",
  "sabcv",
  "sac",
  "sacv",
  "sa/nv",
  "sapibcv",
  "sapicv",
  "sca",
  "se",
  "sezc",
  "spa",
  "srl"
]
