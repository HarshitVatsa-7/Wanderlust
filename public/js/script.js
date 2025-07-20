// Bootstrap validation and star rating system
(() => {
  'use strict';

  // --- Bootstrap Form Validation ---
  const forms = document.querySelectorAll('.needs-validation');

  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }

      form.classList.add('was-validated');
    }, false);
  });

  // --- Star Rating Logic ---
  const starLabels = document.querySelectorAll('.star-label');

  starLabels.forEach((label) => {
    label.addEventListener('click', () => {
      const selectedValue = parseInt(label.getAttribute('data-value'));

      starLabels.forEach((l) => {
        const value = parseInt(l.getAttribute('data-value'));
        if (value <= selectedValue) {
          l.classList.add('text-warning');
        } else {
          l.classList.remove('text-warning');
        }
      });
    });
  });

})();
