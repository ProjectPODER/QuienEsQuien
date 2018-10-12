const rawContractFlags = ContractFlags.rawCollection();
rawContractFlags.aggregateSync = Meteor.wrapAsync(rawContractFlags.aggregate);

// Esto te devuelve:
// {
//     "_id" : null,
//     "avgTransparenciaSeccionesCompletas" : 0.19394081179085274,
//     "avgTemporalidadCamposFundamentales" : 0.5360860919405779,
//     "avgTemporalidadTiempoInsuficiente" : 0.0,
//     "avgTemporalidadDuracionesLargas" : 0.9913440168440754,
//     "avgCompetitividadCamposFundamentales" : 0.9890045619370686,
//     "avgCompetitividadParaisosFiscales" : 0.999649081763949,
//     "avgTrazabilidadEscalaInconsistente" : 0.5407650017545912,
//     "avgTrazabilidadCamposFundamentales" : 0.19394081179085274,
//     "avgTrazabilidadModificaciones" : 0.9780091238741373,
//     "avgTrazabilidadInformacionPartes" : 0.0,
//     "avgTrazabilidadProveedorFantasma" : 0.9998830272546496,
//     "avgTrazabilidadImporteRedondeado" : 0.9879518072289156,
//     "avgTrazabilidadFaltaReferencia" : 0.9660779038484033
// }
export function party_flags_average(_id) {
  check(_id, String);

  let query = [
      {
          $match: {
              'parties.id': _id
          }
      },
      {
          $group: {
              _id: null,
              avgTransparenciaSeccionesCompletas: { $avg:
  "$rules_score.transparencia.secciones-completas" },
              avgTemporalidadCamposFundamentales: { $avg:
  "$rules_score.temporalidad.campos-fundamentales-para-la-temporalidad" },
              avgTemporalidadTiempoInsuficiente: { $avg:
  "$rules_score.temporalidad.tiempo-insuficiente-de-preparacion-de-oferta" },
              avgTemporalidadDuracionesLargas: { $avg:
  "$rules_score.temporalidad.duraciones-larga" },
              avgCompetitividadCamposFundamentales: { $avg:
  "$rules_score.competitividad.campos-fundamentales-para-la-competitividad" },
              avgCompetitividadParaisosFiscales: { $avg:
  "$rules_score.competitividad.paraisos-fiscales" },
              avgTrazabilidadEscalaInconsistente: { $avg:
  "$rules_score.trazabilidad.escala-inconsistente" },
              avgTrazabilidadCamposFundamentales: { $avg:
  "$rules_score.trazabilidad.campos-fundamentales-para-la-trazabilidad" },
              avgTrazabilidadModificaciones: { $avg:
  "$rules_score.trazabilidad.modificaciones-al-contrato" },
              avgTrazabilidadInformacionPartes: { $avg:
  "$rules_score.trazabilidad.informacion-de-las-partes" },
              avgTrazabilidadProveedorFantasma: { $avg:
  "$rules_score.trazabilidad.proveedor-fantasma" },
              avgTrazabilidadImporteRedondeado: { $avg:
  "$rules_score.trazabilidad.importe-redondeado" },
              avgTrazabilidadFaltaReferencia: { $avg:
  "$rules_score.trazabilidad.falta-de-referencia-oficial" }
          }
      }
  ];

  let agg = rawContractFlags.aggregateSync(query)

  return agg;
});
