/* Editorial labels in Portuguese on small screens; brands and audiovisual terms stay intact. */
(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.TakeCutMobileCopy = factory();
})(typeof window === 'undefined' ? this : window, function() {
  const exact = {
    'Selected work / Seleção Take Cut': 'Seleção Take Cut',
    'CUT ROOM': 'SALA DE EDIÇÃO',
    'Take Cut Gear': 'Equipamentos Take Cut',
    'GEAR.': 'EQUIPAMENTOS.',
    'IN': 'ENTRADA', 'OUT': 'SAÍDA', 'TAKE / CUT': 'TOMADA / CORTE',
    'CUT': 'CORTE', 'PLAY': 'ASSISTIR',
    '01 / AI': '01 / IA', '02 / COMMERCIAL': '02 / PUBLICIDADE',
    '03 / SOCIAL': '03 / REDES SOCIAIS', '04 / FILM': '04 / FILME',
    '05 / MOTION': '05 / ANIMAÇÃO', '04 / CASES': '04 / PROJETOS'
  };
  const terms = [
    [/\bAutomotive\b/g, 'Automotivo'],
    [/\bGEAR\b/g, 'EQUIPAMENTO'],
    [/\bsetup\b/g, 'conjunto de equipamentos'],
    [/\bSound [Dd]esign\b/g, 'Desenho de som'],
    [/\bColor Grading\b/g, 'Correção de cor'],
    [/\bMotion Graphics\b/g, 'Animação gráfica'],
    [/\bStorytelling\b/g, 'Narrativa'],
    [/\bVisualizer\b/g, 'Visual musical'],
    [/\bvisualizers\b/g, 'visuais musicais'],
    [/\bvisualizer\b/g, 'visual musical'],
    [/\bgameplay\b/g, 'partida de jogo'],
    [/\bgames\b/g, 'jogos'],
    [/\bmotion\b/g, 'animação'],
    [/\bonline\b/g, 'a distância']
  ];
  return function mobileCopy(text) {
    const trimmed = text.trim();
    if (Object.hasOwn(exact, trimmed)) return text.replace(trimmed, exact[trimmed]);
    return terms.reduce((value, [pattern, replacement]) => value.replace(pattern, replacement), text);
  };
});
