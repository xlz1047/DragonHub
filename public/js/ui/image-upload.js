function uploadSelectedImage(fileInput, onSuccess, onError) {
    let file = fileInput.files[0];
    if (!file) {
        return;
    }

    let formData = new FormData();
    formData.append('image', file);

    fetch('/api/upload', {
        method: 'POST',
        body: formData
    }).then(function (res) {
        if (!res.ok) {
            throw new Error('Image upload failed');
        }
        return res.json();
    }).then(function (data) {
        onSuccess(data.imageUrl);
    }).catch(function (e) {
        console.error('Image upload failed:', e);
        if (onError) {
            onError(e);
        }
    });
}

function bindImageUploadPreview(fileInputId, previewImgId, hiddenUrlInputId) {
    let fileInput = document.getElementById(fileInputId);
    let previewImg = document.getElementById(previewImgId);
    let hiddenInput = document.getElementById(hiddenUrlInputId);
    let statusEl = document.getElementById(fileInputId + '-status');

    if (!fileInput) {
        return;
    }

    fileInput.addEventListener('change', function () {
        if (!fileInput.files[0]) {
            return;
        }

        if (statusEl) {
            statusEl.textContent = 'Uploading...';
        }

        uploadSelectedImage(fileInput, function (imageUrl) {
            if (previewImg) {
                previewImg.src = imageUrl;
                previewImg.classList.remove('hidden');
            }
            if (hiddenInput) {
                hiddenInput.value = imageUrl;
            }
            if (statusEl) {
                statusEl.textContent = 'Photo uploaded';
            }
        }, function () {
            if (statusEl) {
                statusEl.textContent = 'Upload failed, please try again';
            }
        });
    });
}

function resetImageUpload(fileInputId, previewImgId, hiddenUrlInputId) {
    let fileInput = document.getElementById(fileInputId);
    let previewImg = document.getElementById(previewImgId);
    let hiddenInput = document.getElementById(hiddenUrlInputId);
    let statusEl = document.getElementById(fileInputId + '-status');

    if (fileInput) {
        fileInput.value = '';
    }
    if (previewImg) {
        previewImg.src = '';
        previewImg.classList.add('hidden');
    }
    if (hiddenInput) {
        hiddenInput.value = '';
    }
    if (statusEl) {
        statusEl.textContent = '';
    }
}
