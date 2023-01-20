function iniciarApp() {

  const resultado = document.querySelector('#resultado');
  const selectCategorias = document.querySelector('#categorias');

  if (selectCategorias) {
    selectCategorias.addEventListener('change', seleccionarCategoria)
    obtenerCategoria();
  }

  const favoritosDiv = document.querySelector('.favoritos');

  if (favoritosDiv) {
    obtenerFavoritos();
  }


  const modal = new bootstrap.Modal('#modal', {});


  function obtenerCategoria() {
    const url = 'https://www.themealdb.com/api/json/v1/1/categories.php';

    fetch(url)
      .then(respuesta => respuesta.json())
      .then(resultadoDatos => mostrarCategoria(resultadoDatos.categories))

  };


  function mostrarCategoria(categorias = []) {
    categorias.forEach(categoria => {

      const { strCategory } = categoria;

      const option = document.createElement('OPTION');
      option.value = strCategory;
      option.textContent = strCategory;
      selectCategorias.appendChild(option);
    })




  }

  function seleccionarCategoria(e) {

    const categoria = e.target.value;
    const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoria}`;

    fetch(url)
      .then(respuesta => respuesta.json())
      .then(resultado => mostrarReceta(resultado.meals))
  }

  function mostrarReceta(recetas = []) {

    limpiarHTML(resultado);

    const heading = document.createElement('H2');
    heading.classList.add('text-center', 'text-black', 'my-5');
    heading.textContent = recetas.length ? 'Resultados' : 'No hay Resultados';
    resultado.appendChild(heading);

    // * Iterar en los resultados
    recetas.forEach(receta => {
      const { idMeal, strMeal, strMealThumb } = receta;

      const recetaContenedor = document.createElement('DIV');
      recetaContenedor.classList.add('col-md-4');
      const recetaCard = document.createElement('DIV');
      recetaCard.classList.add('card', 'mb-4');

      const recetaImagen = document.createElement('IMG');
      recetaImagen.classList.add('card-img-top');
      recetaImagen.alt = `Imagen de la receta ${strMeal ?? receta.titulo}`;
      recetaImagen.src = strMealThumb ?? receta.img;

      const recetaCardBody = document.createElement('DIV');
      recetaCardBody.classList.add('card-body');

      const recetaHeading = document.createElement('H3');
      recetaHeading.classList.add('card-title', 'mb-3');
      recetaHeading.textContent = strMeal ?? receta.titulo;

      const recetaButton = document.createElement('BUTTON');
      recetaButton.classList.add('btn', 'btn-primary', 'w-100', 'text-white');
      recetaButton.textContent = 'Ver receta';

      //recetaButton.dataset.bsTarget = '#modal';
      //recetaButton.dataset.bsToggle = 'modal';
      recetaButton.onclick = function () {
        seleccionarReceta(idMeal ?? receta.id);
      }

      // *Inyectar el codigo HTML, para que sea visible
      recetaCardBody.appendChild(recetaHeading);
      recetaCardBody.appendChild(recetaButton);

      recetaCard.appendChild(recetaImagen);
      recetaCard.appendChild(recetaCardBody);

      recetaContenedor.appendChild(recetaCard);

      resultado.appendChild(recetaContenedor);

    })

  }

  function seleccionarReceta(id) {
    const url = `https://themealdb.com/api/json/v1/1/lookup.php?i=${id}`;
    fetch(url)
      .then(respuesta => respuesta.json())
      .then(resultado => mostrarRecetaModal(resultado.meals[0]))

  }

  function mostrarRecetaModal(receta) {
    // * Muestra el modal
    const { idMeal, strInstructions, strMeal, strMealThumb } = receta;
    // * Añadir contenido al modal
    const modalTitle = document.querySelector('.modal .modal-title');
    const modalBody = document.querySelector('.modal .modal-body');



    modalTitle.textContent = strMeal;
    modalBody.innerHTML = `
         <img style="border-radius: 1.5%;" class="img-fluid" src="${strMealThumb}" alt="receta ${strMeal}"/>
         <h3 class="my-3">Instrucciones</h3>
         <p>${strInstructions}</p>
         <h3 class="my-3">Ingredientes y Cantidades</h3>

    `;

    const listaGroup = document.createElement('UL');
    listaGroup.classList.add('list-group');

    // * Mostrar cantidades e ingredientes
    for (let i = 1; i <= 20; i++) {
      if (receta[`strIngredient${i}`]) {
        const ingrediente = receta[`strIngredient${i}`];
        const cantida = receta[`strMeasure${i}`];

        const ingredienteLi = document.createElement('LI');
        ingredienteLi.classList.add('list-group-item');
        ingredienteLi.textContent = `${ingrediente} ${cantida}`;
        listaGroup.appendChild(ingredienteLi);
      }
    }
    modalBody.append(listaGroup);

    // * Botones de cerrar y favoritos
    const modalFooter = document.querySelector('.modal-footer');
    limpiarHTML(modalFooter);

    const btnFavorito = document.createElement('BUTTON');
    btnFavorito.classList.add('btn', 'btn-primary', 'col');
    btnFavorito.textContent = existeStorage(idMeal) ? 'Eliminar Favorito' : 'Guardar Favorito';

    // * localstorage
    btnFavorito.onclick = function () {

      if (existeStorage(idMeal)) {
        eliminarFavorito(idMeal);
        btnFavorito.textContent = 'Guardar Favorito';
        mostrarToast('Eliminado Correctamente');

        return;
      }

      agregarFavorito({
        id: idMeal,
        titulo: strMeal,
        img: strMealThumb
      }
      );
      btnFavorito.textContent = 'Eliminar Favorito';
      mostrarToast('Agregado Correctamente');
    }

    const btnCerrarModal = document.createElement('BUTTON');
    btnCerrarModal.classList.add('btn', 'btn-secondary', 'col');
    btnCerrarModal.textContent = 'Cerrar';
    btnCerrarModal.onclick = function () {
      modal.hide();
    }


    modalFooter.appendChild(btnFavorito);
    modalFooter.appendChild(btnCerrarModal);

    modal.show();
  }

  function agregarFavorito(recetaObj) {

    const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
    localStorage.setItem('favoritos', JSON.stringify([...favoritos, recetaObj]));
  }

  function eliminarFavorito(id) {
    const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
    const nuevoFavoritos = favoritos.filter(favorito => favorito.id !== id);
    localStorage.setItem('favoritos', JSON.stringify(nuevoFavoritos));


  }

  function existeStorage(id) {
    const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
    return favoritos.some(favorito => favorito.id === id);
  }

  function mostrarToast(mensaje) {
    const toastDiv = document.querySelector('#toast');
    const toastBody = document.querySelector('.toast-body');
    const toast = new bootstrap.Toast(toastDiv);
    toastBody.textContent = mensaje;
    toast.show();

  }


  function obtenerFavoritos() {
    const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
    if (favoritos.length) {

      mostrarReceta(favoritos);

      return;
    }
    const noFavoritos = document.createElement('P');
    noFavoritos.textContent = 'No hay favoritos';
    noFavoritos.classList.add('fs-4', 'text-center', 'font-bold', 'mt-5');
    favoritosDiv.appendChild(noFavoritos);



  }



  function limpiarHTML(selector) {
    while (selector.firstChild) {
      selector.removeChild(selector.firstChild);
    }


  }


}



document.addEventListener('DOMContentLoaded', iniciarApp);

