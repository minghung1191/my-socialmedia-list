const BASE_URL = "https://user-list.alphacamp.io" //防止網址有變更，以免要依序更改，因此先建立一變數
const INDEX_URL = BASE_URL + "/api/v1/users/"
const users = JSON.parse(localStorage.getItem('favoriteUsers'))

const dataPanel = document.querySelector("#data-panel")
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input') 

// 建立社群清單列表
function renderUserList(data) {
    let rawHTML = ''
    data.forEach((user) => {
        rawHTML += `
        <div class="col-sm-3">
        <div class="mb-2">
        <div class="card m-2" >
        <div>
        <img src="${user.avatar}" class="card-img-top" alt="info-avatar">
        </div>
        <div class="card-body">
          <h5 class="card-title mb-0">${user.name} ${user.surname}</h5>
        </div>
        <div class="card-footer">
        <button class="btn btn-primary btn-show-info" data-bs-toggle="modal" data-bs-target="#user-modal" data-id="${user.id}">更多資訊</button>
        <button class="btn btn-info btn-remove-favorite" data-id="${user.id}" style="background-color: red; border-color: red; color: white;">移除</button>
        </div>
      </div>
      </div>
      </div>`
    })
    dataPanel.innerHTML = rawHTML
}

// 監聽 data panel
// 使用非匿名的函式，能在日後快速找到報錯的地方
dataPanel.addEventListener('click',function onPanelClicked(event){
    //點擊圖片，產生更多詳細資料
    if (event.target.matches('.btn-show-info')) {
        //利用dataset來讀取data-*性質
        showUserModal(event.target.dataset.id)
    //點擊x，將電影加入我的最愛時
    } else if (event.target.matches('.btn-remove-favorite')) {
      removeToFavorite(Number(event.target.dataset.id))
    }
  })

//(Modal)回傳資料並顯示在Modal上
function showUserModal(id) {
    const modalTitle = document.querySelector('#user-modal-title')
    const modalImage = document.querySelector('#user-modal-image')
    const modalDescription = document.querySelector('#user-modal-description')

    axios.get(INDEX_URL + id).then((response) => {
      const user = response.data
      modalTitle.textContent = user.name + ' ' + user.surname
      modalImage.src = user.avatar
      modalDescription.innerHTML = `
      <p>email: ${user.email}</p>
      <p>gender: ${user.gender}</p>
      <p>age: ${user.age}</p>
      <p>region: ${user.region}</p>
      <p>birthday: ${user.birthday}</p>`
    })
  }

//(收藏功能－移除名單)建立要從我的最愛名單移除所點選的電影之函式
function removeToFavorite(id){
    //收藏清單是空的
    if (!users || !users.length) return
    //透過 id 找到要刪除電影的 index；find是找到物件內容，findindex是找到目標之index
    const userIndex = users.findIndex((user) => user.id === id)
    //傳入的 id 在收藏清單中不存在
    if(userIndex === -1) return
    //刪除該筆電影
    users.splice(userIndex,1)
    //存回 local storage
    localStorage.setItem('favoriteUsers', JSON.stringify(users))
    //更新頁面
    renderUserList(users)
  }

renderUserList(users)