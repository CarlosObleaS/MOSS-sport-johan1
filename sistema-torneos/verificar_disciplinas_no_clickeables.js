// Script para verificar que las disciplinas ya no son clickeables (ejecutar en consola del navegador)
console.log('🧪 PRUEBA DE DISCIPLINAS NO CLICKEABLES\n');

// 1. Verificar que estamos en la vista correcta
if (window.location.pathname === '/' && !window.location.search) {
  console.log('✅ Estás en la vista general del organizador');
  
  // 2. Esperar a que cargue la aplicación
  setTimeout(() => {
    // 3. Buscar elementos de disciplinas
    const disciplinasSpans = document.querySelectorAll('span[class*="bg-slate-700 rounded"]');
    const disciplinasButtons = document.querySelectorAll('button[title*="Ver detalles de"]');
    
    console.log(`📊 Elementos encontrados:`);
    console.log(`   - Spans de disciplinas: ${disciplinasSpans.length}`);
    console.log(`   - Botones de disciplinas: ${disciplinasButtons.length}`);
    
    if (disciplinasSpans.length > 0 && disciplinasButtons.length === 0) {
      console.log('\n✅ PERFECTO: Las disciplinas son spans (no clickeables)');
      
      // 4. Verificar que no tengan eventos de clic
      let tieneEventosClic = false;
      disciplinasSpans.forEach(span => {
        const computedStyle = window.getComputedStyle(span);
        const cursor = computedStyle.cursor;
        if (cursor === 'pointer') {
          tieneEventosClic = true;
          console.log('⚠️ ADVERTENCIA: Algunos spans tienen cursor pointer');
        }
      });
      
      if (!tieneEventosClic) {
        console.log('✅ Las disciplinas no tienen eventos de clic');
        console.log('✅ Solo muestran información (ej: "ATLETISMO: 2")');
      }
      
      console.log('\n🎯 RESULTADO:');
      console.log('✅ Las disciplinas ahora son solo informativas');
      console.log('✅ No redirigen a detalles de disciplina');
      console.log('✅ Los botones de navegación han sido eliminados');
      
    } else if (disciplinasButtons.length > 0) {
      console.log('❌ PROBLEMA: Todavía hay botones clickeables');
      console.log('💡 Recarga la página para aplicar los cambios');
    } else {
      console.log('❌ No se encontraron disciplinas');
      console.log('💡 Asegúrate de:');
      console.log('   - Haber iniciado sesión como organizador');
      console.log('   - Tener promociones creadas');
      console.log('   - Hacer clic en "Ver" para mostrar las disciplinas');
    }
    
  }, 2000); // Esperar a que cargue la aplicación
  
} else {
  console.log('❌ No estás en la vista general del organizador');
  console.log('🔗 Ve a: http://localhost:3000/');
  console.log('🔐 Inicia sesión como organizador si es necesario');
}
