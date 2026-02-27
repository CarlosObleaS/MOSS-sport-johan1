// Script para probar navegación a disciplinas (ejecutar en consola del navegador)
console.log('🧪 PRUEBA DE NAVEGACIÓN A DISCIPLINAS\n');

// 1. Verificar que estamos en la vista correcta
if (window.location.pathname === '/' && !window.location.search) {
  console.log('✅ Estás en la vista general del organizador');
  
  // 2. Esperar a que cargue la aplicación
  setTimeout(() => {
    // 3. Buscar botones de disciplinas
    const botonesDisciplina = document.querySelectorAll('button[title*="Ver detalles de"]');
    console.log(`📋 Encontrados ${botonesDisciplina.length} botones de disciplinas`);
    
    if (botonesDisciplina.length > 0) {
      console.log('\n🎯 PASOS PARA PROBAR:');
      console.log('1. Haz clic en cualquier botón de disciplina (ej: "ATLETISMO: 2 →")');
      console.log('2. Debería redirigirte a la vista de detalles de esa disciplina');
      console.log('3. La URL debería cambiar a: /?disciplina=NOMBRE_DISCIPLINA');
      console.log('4. Deberías ver el ranking y calendario de esa disciplina');
      
      // 4. Agregar listener para detectar clics
      botonesDisciplina.forEach(boton => {
        boton.addEventListener('click', (e) => {
          const disciplina = e.target.closest('button').getAttribute('title').replace('Ver detalles de ', '');
          console.log(`🔗 Clic en disciplina: ${disciplina}`);
          console.log(`🌐 Redirigiendo a: /?disciplina=${disciplina}`);
        });
      });
      
      console.log('\n✅ Listeners agregados. Los clics se registrarán en la consola.');
      
    } else {
      console.log('❌ No se encontraron botones de disciplinas');
      console.log('💡 Asegúrate de:');
      console.log('   - Haber iniciado sesión como organizador');
      console.log('   - Tener promociones creadas con disciplinas asignadas');
      console.log('   - Hacer clic en "Ver" para mostrar las disciplinas');
    }
    
  }, 2000); // Esperar a que cargue la aplicación
  
} else {
  console.log('❌ No estás en la vista general del organizador');
  console.log('🔗 Ve a: http://localhost:3000/');
  console.log('🔐 Inicia sesión como organizador si es necesario');
}
