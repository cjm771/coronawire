window.onload = function() {
  document.querySelector('.locale-selection-area__select').addEventListener('change', function(e) {
    window.location.href = '/region/' + e.target.value;
  });
}