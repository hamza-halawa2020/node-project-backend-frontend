function deleteTask() {
    const btn = document.getElementById('deleteBtn');
    const id = btn.getAttribute('data-id');
    console.log(id);
    axois.delete('/event/delete/' + id)
    .then((res) => {
        console.log(res.data);
     })
     .catch((err => {
        console.log(err);
     }))
}