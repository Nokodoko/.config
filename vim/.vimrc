<leader>t :TableModeEnable<cr>
<leader>d :TableModeDisable<cr>
<BS> :bd<cr>
<M-Up> :bn<cr>
<M-Down> :bp<cr>
<C-Down> :vsplit term://zsh<cr>:set number!<cr>:set relativenumber!<cr>a
<M-(> ci(
<M-{> ci{
<M-"> ci"
<M-'> ci'
<leader>a :help airline-configuration<cr>
<leader>B :split $HOME/.zshrc<cr>
<leader>e :split $HOME/.config/nvim/init.vim<cr>
<leader>E :vsplit $HOME/.config/nvim/init.vim<cr>
 :source $HOME/.config/nvim/init.vim<cr>
<leader>q :term://gtop<cr>:set number!<cr>:set relativenumber!<cr>:vsplit term://glances<cr>:set number!<cr>:set relativenumber!<cr>
<leader>3 :vsplit term://tty-clock -c<cr>:set number!<cr>:set relativenumber!<cr>:split term://zsh<cr>:split term://cmus<cr><esc><C-w>h<C-w>h
<F12> :vsplit term://zsh<cr>:set number!<cr>:set relativenumber!<cr>:vsplit term://tty-clock -c<cr>:split term://cmus<cr>:split term://calcurse<cr><C-W>h<C-W>h
<leader>1 :vsplit term://zsh<cr>:set number!<cr>:set relativenumber!<cr>:vsplit term://neomutt<cr><cr>:vsplit term://glances<cr>:split term://gtop<cr>:split term://cmus<cr>:vsplit term://calcurse<cr><C-W>k<C-W>k:vsplit term://tty-clock -cs<cr><C-w>h<C-w>h<C-w>h
<leader>m :vsplit term://cmus<cr>
<leader>o :set ma<cr>
<leader><F2> :split term://cmus<cr>
<leader>r <C-w>la<esc>k<cr><C-\><C-n><C-w>h<esc>
<leader>s :SemanticHighlightToggle<cr>
<Down> :split term://zsh<cr>:set number!<cr>:set relativenumber!<cr>a
<leader><C-Space> :vsplit term://zsh<cr>:set number!<cr>:set relativenumber!<cr>a
<leader><Right>  :vsplit term://zsh<cr>:set number!<cr>:set relativenumber!<cr>a
<leader>z :split term://tty-clock -c<cr>:set number!<cr>:set relativenumber!<cr>:
<leader>M :vsplit erm://neomutt<cr>
<esc> A
' cw
" caw
<C-'> dw<esc><esc>
<C-Space> f cw
<leader>> <C-w>v<C-w>60>
<leader>< <C-w>v<C-w>60<
<silent> <Right> :Files<cr>
<silent> <S-F6> :Lines<cr>
<leader>? :Helptags<cr>
<silent> <Up> :RG<cr> 
<Left> :Buffers<cr>
? :Lines<cr>

 Use K to show documentation in preview window.
<silent> K :call <SID>show_documentation()<CR>

Splitting
<leader>v :vsplit<cr>
<leader>c :split<cr>

<leader>b :checkhealth<cr>
<leader>C :CocInfo<cr>
<M-r> :CocRestart<cr>
<leader>i :CocInstall
<leader>L :CocList 
<F3> :w!<cr>
<leader>V :VimBeGood<cr>

<silent> <M-F10> :KittyNavigateLeft<cr>
<silent> <M-F4> :KittyNavigateDown<cr>
<silent> <M-F5> :KittyNavigateUp<cr>
<silent> <M-F6> :KittyNavigateRight<cr>

Q :q!<cr>
<F9> :set hlsearch!<cr> 

 augroup _git
   autocmd!
   autocmd FileType gitcommit setlocal wrap
   autocmd FileType gitcommit setlocal spell
 augroup end

 augroup _markdown
   autocmd!
   autocmd FileType markdown setlocal wrap
   autocmd FileType markdown setlocal spell
 augroup end

 augroup _auto_resize
   autocmd!
   autocmd VimResized * tabdo wincmd = 
 augroup end

 augroup _alpha
   autocmd!
   autocmd User AlphaReady set showtabline=0 | autocmd BufUnload <buffer> set showtabline=2
 augroup end

 augroup vimwikwi
   autocmd!
   autocmd FileType vimwiki inoremap b<Right> _**_<esc>hi
   autocmd FileType vimwiki inoremap i<Right> __<esc>ha
 augroup end

 augroup zsh
   autocmd!
   autocmd FileType zsh inoremap bh #!/bin/bash
   autocmd FileType zsh inoremap .. ${}<esc>T{i
   autocmd FileType zsh inoremap :: $()<esc>T(i
   autocmd FileType zsh inoremap a<Right> alias=''<esc>i
   autocmd FileType zsh inoremap f<Right> function() {<cr>}<esc>kfn;a 
   autocmd FileType zsh inoremap  for<esc>odo<esc>odone<esc>O
   autocmd FileType zsh inoremap :case case in<esc>;;<esc>oesac
   autocmd FileType zsh inoremap :read read -p "" ANSWER<esc>F"ci"
   autocmd FileType zsh inoremap ii if []; then<esc>othen<esc>ofi<esc>2kf[ci[
   autocmd FileType zsh inoremap :? RESPONSE_CODE=$?
   autocmd FileType zsh inoremap :ns ns=notify-send
 augroup end

augroup go
  autocmd!
   autocmd FileType go colorscheme tokyodark
   autocmd FileType go inoremap v<Right> var ()<esc>ha<cr><esc>O
   autocmd FileType go inoremap nN \✗
   autocmd FileType go inoremap yY \✓
   autocmd FileType go inoremap  /**/<esc>F*i
   autocmd FileType go inoremap pout println();space><esc>T(i
   autocmd FileType go inoremap lout log.Println()<space><esc>T(i
   autocmd FileType go inoremap iu ioutil.
   autocmd FileType go inoremap lof log.Printf()<space><esc>T(i
   autocmd FileType go inoremap scan fmt.Scanln()<space><esc>T(i
   autocmd FileType go inoremap fout fmt.Println()<space><esc>T(i
   autocmd FileType go inoremap fof fmt.Printf()<space><esc>T(i
   autocmd FileType go inoremap fos fmt.Sprintf()<space><esc>T(i
   autocmd FileType go inoremap foe fmt.Errorf()<space><esc>T(i
   autocmd FileType go inoremap toe t.Error()<space><esc>T(i
   autocmd FileType go inoremap .. :=
   autocmd FileType go inoremap :imp import
   autocmd FileType go inoremap b<Right> []byte
   autocmd FileType go inoremap f<Right> for i := ; i ; i {}<esc>i<cr><esc>k0f;i
   autocmd FileType go inoremap :case case ():<esc>F)i
   autocmd FileType go inoremap :s switch {}<esc>i<cr><esc>Ocase:<esc>Fea
   autocmd FileType go inoremap :ar x := []{}<esc>F{i
   autocmd FileType go inoremap ** :[]{}<esc>F{i
   autocmd FileType go inoremap :dsl append([:],[:])<esc>0f:
   autocmd FileType go inoremap :make make([],){}<esc>i<cr><esc>k0f]a
   autocmd FileType go inoremap :: ...
   autocmd FileType go inoremap :L <-
   autocmd FileType go inoremap :gar var x = []{}<esc>F{i
   autocmd FileType go inoremap :add x = append(x,)<esc>0fx
   autocmd FileType go inoremap :append x = append(x,...)<esc>0fx
   autocmd FileType go inoremap :del x = append([:],[:]...)<esc>0f:
   autocmd FileType go inoremap :amap m[]=type{}<esc>0f[a
   autocmd FileType go inoremap :map m := make(map[type]type)
   autocmd FileType go inoremap :dmap delete(m,key)<esc>Fk
   autocmd FileType go inoremap s<Right> type name struct{}<esc>i<cr><esc>Ofield type<esc>kFn
   autocmd FileType go inoremap m<Right> func main(){}<esc>i<cr><esc>O
   autocmd FileType go inoremap i<Right> type name interface{}<esc>i<cr><esc>Omethod<esc>kFm
   autocmd FileType go inoremap vok //TEST<cr>v, ok := m[""]<cr>fmt.Println(v)<cr>fmt.Println(ok)<cr><cr>if v, ok := m[""]; ok{}<esc>i<cr>fmt.Println("value:", v)<esc>5k0f"a
   autocmd FileType go inoremap <M-r> for i, v := range * {}<esc>i<cr>fmt.Println(i, v)<cr><esc>2k0f*cw
   autocmd FileType go inoremap <M-R> for v := range * {}<esc>i<cr>fmt.Println(v)<cr><esc>2k0f*cw
   autocmd FileType go inoremap  :v v, ok := <-c<esc>ofmt.Println(v,ok)
   autocmd FileType go inoremap :mar b, err := json.Marshal()<cr>if err != nil{}<esc>i<cr><esc>Ofmt.Println("error:", err)<esc>jofmt.Println(string(b))<esc>o//os.STdout.Write(b)<esc>5k0f(a
   autocmd FileType go inoremap :umar err := json.Unmarshal()<cr>if err != nil{}<esc>i<cr><esc>Ofmt.Println("error:", err)<esc>jofmt.Println(var)<esc>o//os.STdout.Write(var)<esc>5k0f(a
   autocmd FileType go inoremap  func (b By--) Len() int {return len(b)}<cr>func (b By--) Swap (i, j int) {b[i], b[j]=b[j], b[i]}<cr>func (b By--) Less (i, j int) bool {return b[i].-- < b[j].--}<cr><cr>sort.Sort(By--(var))
   autocmd FileType go inoremap e<Right> if err != nil{}<esc>i<cr><esc>Ofmt.Println(err)<esc>
   "autocmd FileType go inoremap e<Right> if err != nil{ fmt.Println(err) }
   autocmd FileType go inoremap e<down> if err != nil{ log.Fatal(err) }
   autocmd FileType go inoremap :wait var wg sync.WaitGroup<cr>wg.Add()<cr>wg.Done()<cr>wg.Wait()
   autocmd FileType go inoremap :mut var mu sync.Mutex<cr>mu.Lock()<cr>mu.Unlock()
   autocmd FileType go inoremap <M-R> return
   autocmd FileType go inoremap <Right> string
   autocmd FileType go inoremap <M-CR> return
   autocmd FileType go inoremap <M-Right> func(){<cr>}<esc>k0fca 
   autocmd FileType go inoremap <Left> int
   autocmd FileType go inoremap <Up> []byte()<esc>i
   autocmd FileType go inoremap <M-F20> []int{}<esc>i
   autocmd FileType go inoremap <Down> type
   autocmd FileType go inoremap <C-Down> func 
   autocmd FileType go inoremap <M-Left> map[key](value)<esc>Fk
   autocmd FileType go inoremap :wg var wg sync.WaitGroup
   autocmd FileType go inoremap :mu var mu sync.Mutex
   autocmd FileType go inoremap <M-Up> c := make (chan )<esc>F a
   autocmd FileType go inoremap  func() {<cr>}()<esc>O
   autocmd FileType go inoremap  (t *testing.T) {<cr>}esc>O
   autocmd FileType go inoremap  (b *testing.B) {<cr>}<esc>Ofor i:=0; i<b.N; i++
   autocmd FileType go inoremap <F5> chan 
   autocmd FileType go inoremap <F6> ctx := context.Background()
   autocmd FileType go nnoremap <C-S-F7> :GeDoc 
   autocmd FileType go nnoremap <F12> :GoInfo<cr>
   autocmd FileType go nnoremap <F19> :GoPlay<cr>
   autocmd FileType go nnoremap <F16> :GoAlternate<cr>
   autocmd FileType go nnoremap <M-f> daf
   autocmd FileType go nnoremap <M-F> dif
   autocmd FileType go nnoremap <F18> :go tool! cover -html=c.out
   autocmd FileType go inoremap <S-F7> <esc> :GoFillStruct<cr>
   autocmd FileType go nnoremap <F7> res, err := http.Get()<cr>if err != nil{<cr>}<esc>Olog.Fatal(err)
 augroup end

 augroup terraform
   autocmd!
   autocmd FileType tf inoremap v<Right> variable ""{}<esc>F"ci"
   autocmd FileType tf inoremap m<Right> variable ""{}<esc>i<cr>type = map() <cr><esc>Odefault = {}<esc>i<cr>mykey = <cr><esc>4kf"ci"
   autocmd FileType tf inoremap l<Right> variable ""{}<esc>i<cr>type = list<cr><esc>Odefault = []<esc>2kF"ci"
   autocmd FileType tf inoremap t<Right> type = ""<esc>ci"
   autocmd FileType tf inoremap <Right> string
   autocmd FileType tf inoremap <Left> int
 augroup end
