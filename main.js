const BASE_URL = "https://user-list.alphacamp.io" //防止網址有變更，以免要依序更改，因此先建立一變數
const INDEX_URL = BASE_URL + "/api/v1/users/"
const users = [] //建立容器容納其中的陣列
const USERS_PER_PAGE = 20 //每頁只顯示20筆社群資料

const dataPanel = document.querySelector("#data-panel")
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input') 
const paginator = document.querySelector('#paginator')

let filteredUsers = []


// 建立社群清單列表
function renderUserList(data) {
    let rawHTML = ''
    data.forEach((user) => {
        rawHTML += `
        <div class="col-sm-3">
        <div class="mb-2">
        <div class="card m-2" >
        <div class="card-image">
        <img src="${user.avatar}" class="card-img-top" alt="info-avatar">
        </div>
        <div class="card-body">
          <h5 class="card-title mb-0">${user.name} ${user.surname}</h5>
        </div>
        <div class="card-footer">
        <button class="btn btn-primary btn-show-info" data-bs-toggle="modal" data-bs-target="#user-modal" data-id="${user.id}">更多資訊</button>
        <button class="btn btn-info btn-add-favorite" data-id="${user.id}">加入收藏</button>
        </div>
      </div>
      </div>
      </div>`
    })
    console.log(rawHTML)
    dataPanel.innerHTML = rawHTML
}

//顯示詳細資料：回傳資料並顯示在Modal上
function showUserModal(id) {
  const modalTitle = document.querySelector('#user-modal-title')
  const modalImage = document.querySelector('#user-modal-image')
  const modalDescription = document.querySelector('#user-modal-description')

  axios.get(INDEX_URL + id).then((response) => {
    const user = response.data
    modalTitle.innerText = `${user.name} ${user.surname}`
    modalImage.src = user.avatar
    modalDescription.innerHTML = `
    <p>email: ${user.email}</p>
    <p>gender: ${user.gender}</p>
    <p>age: ${user.age}</p>
    <p>region: ${user.region}</p>
    <p>birthday: ${user.birthday}</p>`
  })
}
//例用‘...’展開運算子，直接展開並push每一陣列元素至users
axios.get(INDEX_URL).then((response) => {
    users.push(...response.data.results)
    renderPaginator(users.length)
    renderUserList(getUsersByPage(1))
   })

// 監聽 data panel
// 使用非匿名的函式，能在日後快速找到報錯的地方
dataPanel.addEventListener('click',function onPanelClicked(event){
    //點擊圖片，產生更多詳細資料
    if (event.target.matches('.btn-show-info')) {
        //利用dataset來讀取data-*性質(將html的命名方式需更改為JS命名方式才能呼叫)
        showUserModal(event.target.dataset.id)
    } else if (event.target.matches('.btn-add-favorite')) {
        addToFavorite(Number(event.target.dataset.id))
    }
  })

//搜尋功能：監聽搜尋keywords並提交事件
searchForm.addEventListener('submit', function onSearchFormSubmitted(event)  {
  //防止瀏覽器預設行為，使在提交搜尋表單時，頁面不會刷新
  event.preventDefault()
  //取得關鍵字：trim:把字串頭尾空格去掉;toLowerCase:把字串轉成小寫
  const keyword = searchInput.value.trim().toLowerCase()
  //沒有輸入東西時，進行加入錯誤處理
  if (!keyword.length) {
    return alert('請輸入有效字串！')
  }
  //篩選社群清單
  filteredUsers = users.filter((user) =>
    //includes:當輸入空字串時，所有電影都還是會顯現
    user.name.toLowerCase().includes(keyword) || user.surname.toLowerCase().includes(keyword)
  )
  //進行錯誤處理：當沒有符合條件的名稱時
  if (filteredUsers.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的名稱`)
  }
  //搜尋結果
  renderUserList(getUsersByPage(1))
  renderPaginator(filteredUsers.length)
})

//收藏功能：建立點擊＋時的監聽事件，放入local storage暫存，並加進我的最愛之函式
function addToFavorite(id){
  //JSON.parse將原本的字串轉為陣列，如果是空的則回傳null
  const list = JSON.parse(localStorage.getItem('favoriteUsers')) || []
  //find為陣列操作方式，找到符合條件之物件時便回傳，暫時存在movie變數中
  const user = users.find(user => user.id === id)
  //因一個電影必須只能收藏一次，而建立此判別式
  //如果List中，已有目標存在則進行回傳
  if (list.some(user => user.id === id)) {
    return alert('此人物已經在收藏清單中！')
  }
  //把符合條件之movie推進list中
  list.push(user)
  //將收藏清單進行更新，同步至localStorage中
  localStorage.setItem('favoriteUsers', JSON.stringify(list))
}

//分頁功能：
//建立進行資料切割之函式
function getUsersByPage(page) {
  //若‘？’以前為條件，如果是true:則回傳filteredUsers，如果是false:則回傳users
  const data = filteredUsers.length ? filteredUsers : users
  //計算起始 index
  const startIndex = (page - 1) * USERS_PER_PAGE
  //回傳切割後的新陣列
  return data.slice(startIndex, startIndex + USERS_PER_PAGE)
}
//建立利用總數量計算總共要多少分頁的函式
function renderPaginator(amount) {
  //計算總頁數
  const numberOfPages = Math.ceil(amount / USERS_PER_PAGE) //Math.ceil為無條件進位
  //製作 template
  let rawHTML = ''
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  //放回 HTML
  paginator.innerHTML = rawHTML
}
// 監聽分頁標籤
paginator.addEventListener('click', function onPaginatorClicked(event) {
  //如果被點擊的不是 a 標籤，結束
  if (event.target.tagName !== 'A') return

  //透過 dataset 取得被點擊的頁數
  const page = Number(event.target.dataset.page)
  //更新畫面
  renderUserList(getUsersByPage(page))
})  