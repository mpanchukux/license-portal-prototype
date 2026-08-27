/* ============================================================================
   page-security.js — the inner Account page: change password. Same sticky Save
   as Account, and a back gutter that goes up one level.
   ============================================================================ */

wirePageSave('#securityView', '#secSaveBtn', '#secSavedNote');
guardLinks();

var secBackBtn = $('#secBackBtn');
if(secBackBtn) secBackBtn.addEventListener('click', function(){ location.href = 'account.html'; });
