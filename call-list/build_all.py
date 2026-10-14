# 全国版の全体リストを作成する（xlsxwriter版：テレアポ管理タブにExcelのチェックボックスを入れるため）
# usage: python3 build_all.py <schools.tsv> <phones.tsv> <region label> <out.xlsx>
import sys, csv, re
import xlsxwriter
from xlsxwriter.utility import xl_rowcol_to_cell as RC, xl_col_to_name as CN
src, phf, region, out = sys.argv[1:5]
PREFS='北海道 青森県 岩手県 宮城県 秋田県 山形県 福島県 茨城県 栃木県 群馬県 埼玉県 千葉県 東京都 神奈川県 新潟県 富山県 石川県 福井県 山梨県 長野県 岐阜県 静岡県 愛知県 三重県 滋賀県 京都府 大阪府 兵庫県 奈良県 和歌山県 鳥取県 島根県 岡山県 広島県 山口県 徳島県 香川県 愛媛県 高知県 福岡県 佐賀県 長崎県 熊本県 大分県 宮崎県 鹿児島県 沖縄県'.split()
phones={}
for row in csv.reader(open(phf,encoding='utf-8'),delimiter='\t'):
    row+=['']*(6-len(row)); no,nm,tel,conf,url,memo=row[:6]; phones[int(no)]=dict(tel=tel,conf=conf,src=url,memo=memo)
recs=[]
for n,(name,addr,sid,course) in enumerate(csv.reader(open(src,encoding='utf-8'),delimiter='\t'),1):
    p=re.match(r'(北海道|東京都|(?:京都|大阪)府|.{2,3}県)',addr).group(1); ph=phones.get(n,{})
    tel=ph.get('tel') or ''
    recs.append(dict(name=name,pref=p,code=f'{PREFS.index(p)+1:02d}{p}',city=addr[len(p):],course=course,
        url=f'https://www.gakkou.net/kou/view/index_{sid}.html',tel=tel,conf=(ph.get('conf') if tel else '要調査'),memo=ph.get('memo',''),src=ph.get('src','')))
N=len(recs)
wb=xlsxwriter.Workbook(out)
FONT='Yu Gothic'
def fmt(**k):
    d={'font_name':FONT,'font_size':10,'valign':'vcenter'}; d.update(k); return wb.add_format(d)
CONFC={'高':'#C6EFCE','中':'#FFEB9C','低':'#FFC7CE','要調査':'#FFC7CE'}

# ---------- 1. 架電リスト ----------
ws=wb.add_worksheet('架電リスト')
RESULTS=['未架電','不在・折返し待ち','担当者不在','資料送付','アポ獲得','検討中','NG','番号不明']
ws.write(0,0,f'私立高等学校 架電リスト（{region}／{N}校）',fmt(font_size=14,bold=True))
ws.write(1,0,'出典：学校ネット 私立高校検索結果（ご提供の貼り付けデータ）。電話番号は2026年10月にWeb検索で調査（確度はF列、出典はN列）。架電前に「確度：中・低」の番号は念のためご確認ください。',fmt(font_size=9,font_color='#595959'))
H=['No.','都道府県','所在地（市区町村）','学校名','電話番号','番号の確度','学科','架電日','担当者','架電結果','次回連絡日','メモ','電話番号の補足','電話番号の出典','学校情報ページ']
W=[6,10,18,38,15,9,16,12,12,16,12,30,46,40,12]
hr=3; B=dict(border=1,border_color='#BFBFBF')
hf=fmt(bold=True,font_color='#FFFFFF',bg_color='#1F4E78',align='center',text_wrap=True,**B)
for c,(h,w) in enumerate(zip(H,W)): ws.write(hr,c,h,hf); ws.set_column(c,c,w)
base=fmt(**B); ctr=fmt(align='center',**B); inp=fmt(bg_color='#FFF2CC',**B); inpd=fmt(bg_color='#FFF2CC',num_format='yyyy/mm/dd',**B)
txt=fmt(num_format='@',**B); txtin=fmt(num_format='@',bg_color='#FFF2CC',**B)
memo=fmt(font_size=9,text_wrap=True,**B); srcf=fmt(font_size=8,font_color='#595959',text_wrap=True,**B)
link=fmt(font_color='#0563C1',underline=1,align='center',**B)
conff={k:fmt(align='center',bg_color=v,**B) for k,v in CONFC.items()}
for i,r in enumerate(recs):
    row=hr+1+i
    ws.write_number(row,0,i+1,ctr); ws.write(row,1,r['pref'],base); ws.write(row,2,r['city'],base); ws.write(row,3,r['name'],base)
    ws.write_string(row,4,r['tel'],txt if r['tel'] else txtin)
    ws.write(row,5,r['conf'],conff.get(r['conf'],ctr)); ws.write(row,6,r['course'],base)
    ws.write_blank(row,7,None,inpd); ws.write_blank(row,8,None,inp); ws.write(row,9,'未架電',inp); ws.write_blank(row,10,None,inpd); ws.write_blank(row,11,None,inp)
    ws.write(row,12,r['memo'],memo); ws.write(row,13,r['src'],srcf); ws.write_url(row,14,r['url'],link,string='開く')
last=hr+N
ws.freeze_panes(hr+1,5); ws.autofilter(hr,0,last,len(H)-1)
ws.data_validation(hr+1,9,last,9,{'validate':'list','source':RESULTS})
for c in (7,10): ws.data_validation(hr+1,c,last,c,{'validate':'date','criteria':'>','value':36526,'error_title':'日付','error_message':'日付で入力してください（例：2026/10/9）','ignore_blank':True})
rng=f'A{hr+2}:{CN(len(H)-1)}{last+1}'
ws.conditional_format(rng,{'type':'formula','criteria':f'=$J{hr+2}="アポ獲得"','format':wb.add_format({'bg_color':'#C6EFCE'})})
ws.conditional_format(rng,{'type':'formula','criteria':f'=$J{hr+2}="NG"','format':wb.add_format({'bg_color':'#D9D9D9','font_color':'#808080'})})
ws.repeat_rows(hr); ws.set_landscape(); ws.fit_to_pages(1,0)

# ---------- 2. テレアポ管理（私立全国版）：参考シート（DXハイスクール テレアポKPIシート）の書式 ----------
t=wb.add_worksheet('テレアポ管理（私立全国版）')
CHK=['資料送付','商談希望','ピック','受注済','提案NG']
TH=['都道府県名','公私','学校設置者名','学校名','電話番号','新規継続','学科']+CHK+['偏差値帯','架電回数','テレアポ1：日付','架電最新結果','テレアポ1：詳細','取得情報（担当先生、メールアドレス、住所）','担当者','偏差値','番号の確度','電話番号の補足','学校情報ページ']
TW=[11,9,18,34,15,10,16,7,7,7,7,7,15,8,12,13,52,34,10,7,8,40,11]
CI={h:i for i,h in enumerate(TH)}
thr=4; tl=thr+N
t.write_url(1,1,'internal:\'使い方・注意事項\'!A1',fmt(font_color='#1155CC',underline=1),string='DXハイスクール テレアポ架電優先順位・運用ルール（私立高校 全国版）')
t.write(2,1,f'私立高校 全国47都道府県／{N}校。電話番号は2026年10月にWeb検索で調査（確度・補足はU〜V列）。資料送付〜提案NGはクリックでチェックできます。',fmt(font_size=9,font_color='#595959'))
G=dict(border=1,border_color='#D9D9D9')
for c,(h,w) in enumerate(zip(TH,TW)):
    t.write(thr,c,h,fmt(bold=True,font_size=9 if h in CHK else 10,bg_color='#00FFFF',align='center' if h in CHK else 'left',left=1,right=1,top=1,left_color='#D9D9D9',right_color='#D9D9D9',top_color='#D9D9D9',bottom=2))
    t.set_column(c,c,w)
t.set_row(thr,20)
tb=fmt(valign='bottom',**G); tbt=fmt(valign='bottom',num_format='@',**G); tbw=fmt(valign='bottom',text_wrap=True,**G)
blk=fmt(valign='top',text_wrap=True,border=1)          # 学科・偏差値帯（黒枠・上寄せ）
blkc=fmt(align='center',border=1)                     # 偏差値
chk=fmt(align='center',valign='bottom',**G)
num=fmt(align='right',valign='bottom',**G); dte=fmt(align='right',valign='bottom',num_format='m/d',**G)
tm=fmt(font_size=9,valign='bottom',text_wrap=True,**G)
tlink=fmt(font_color='#0563C1',underline=1,align='center',valign='bottom',**G)
tconf={k:fmt(align='center',valign='bottom',bg_color=v,**G) for k,v in CONFC.items()}
for i,r in enumerate(recs):
    row=thr+1+i
    t.write(row,CI['都道府県名'],r['code'],tb); t.write(row,CI['公私'],'私立',tb); t.write_blank(row,CI['学校設置者名'],None,tb)
    t.write(row,CI['学校名'],r['name'],tb); t.write_string(row,CI['電話番号'],r['tel'],tbt); t.write_blank(row,CI['新規継続'],None,tb)
    t.write(row,CI['学科'],r['course'],blk)
    for h in CHK: t.insert_checkbox(row,CI[h],False,chk)
    t.write_blank(row,CI['偏差値帯'],None,blk); t.write_number(row,CI['架電回数'],0,num); t.write_blank(row,CI['テレアポ1：日付'],None,dte)
    t.write_blank(row,CI['架電最新結果'],None,tb); t.write_blank(row,CI['テレアポ1：詳細'],None,tbw)
    t.write_blank(row,CI['取得情報（担当先生、メールアドレス、住所）'],None,tbw); t.write_blank(row,CI['担当者'],None,tb); t.write_blank(row,CI['偏差値'],None,blkc)
    t.write(row,CI['番号の確度'],r['conf'],tconf.get(r['conf'],tb)); t.write(row,CI['電話番号の補足'],r['memo'],tm)
    t.write_url(row,CI['学校情報ページ'],r['url'],tlink,string='開く')
    t.set_row(row,30)
t.freeze_panes(thr+1,4); t.autofilter(thr,0,tl,len(TH)-1)
col=lambda h:CI[h]
def tdv(h,src): t.data_validation(thr+1,col(h),tl,col(h),{'validate':'list','source':src})
tdv('新規継続',['新規','継続'])
tdv('偏差値帯',['進学校（60以上）','中堅（45〜59）','中堅以下（44以下）'])
LAST=['担当不在','受付NG','担当者NG','資料送付','商談希望','不通','受付時間外','番号不明']
tdv('架電最新結果',LAST)
t.data_validation(thr+1,col('テレアポ1：日付'),tl,col('テレアポ1：日付'),{'validate':'date','criteria':'>','value':36526,'ignore_blank':True,'error_title':'日付','error_message':'日付で入力してください（例：10/7）'})
t.data_validation(thr+1,col('架電回数'),tl,col('架電回数'),{'validate':'integer','criteria':'>=','value':0,'ignore_blank':True})
t.data_validation(thr+1,col('偏差値'),tl,col('偏差値'),{'validate':'integer','criteria':'between','minimum':20,'maximum':80,'ignore_blank':True})
L=lambda h:CN(col(h)); r0=thr+2; trng=f'A{r0}:{CN(len(TH)-1)}{tl+1}'
t.conditional_format(trng,{'type':'formula','criteria':f'=${L("受注済")}{r0}=TRUE','format':wb.add_format({'bg_color':'#C6EFCE'})})
t.conditional_format(trng,{'type':'formula','criteria':f'=${L("商談希望")}{r0}=TRUE','format':wb.add_format({'bg_color':'#FFF2CC'})})
t.conditional_format(trng,{'type':'formula','criteria':f'=OR(${L("提案NG")}{r0}=TRUE,${L("架電最新結果")}{r0}="受付NG",${L("架電最新結果")}{r0}="担当者NG")','format':wb.add_format({'bg_color':'#A6A6A6'})})
t.repeat_rows(thr); t.set_landscape(); t.set_paper(9); t.fit_to_pages(1,0)

# ---------- 3. 都道府県別集計 ----------
s=wb.add_worksheet('都道府県別集計')
s.write(0,0,'都道府県別 進捗集計（架電リスト・テレアポ管理の入力に連動して自動計算）',fmt(font_size=14,bold=True))
SH=['都道府県','学校数','電話番号入力済','架電済']+RESULTS[1:]+['架電回数（合計）']+[f'{h}（☑数）' for h in CHK]
sh=fmt(bold=True,font_color='#FFFFFF',bg_color='#1F4E78',align='center',text_wrap=True,**B)
for c,h in enumerate(SH): s.write(2,c,h,sh); s.set_column(c,c,18 if c==0 else 11)
s.set_row(2,32)
KR=lambda c:f"'架電リスト'!${c}${hr+2}:${c}${last+1}"
TR=lambda h:f"'テレアポ管理（私立全国版）'!${L(h)}${thr+2}:${L(h)}${tl+1}"
prefs=[]
for r in recs:
    if r['pref'] not in prefs: prefs.append(r['pref'])
sb=fmt(**B)
for i,p in enumerate(prefs):
    row=3+i; R=row+1; s.write(row,0,p,sb)
    s.write_formula(row,1,f'=COUNTIF({KR("B")},A{R})',sb)
    s.write_formula(row,2,f'=COUNTIFS({KR("B")},A{R},{KR("E")},"<>")',sb)
    s.write_formula(row,3,f'=B{R}-COUNTIFS({KR("B")},A{R},{KR("J")},"未架電")-COUNTIFS({KR("B")},A{R},{KR("J")},"")',sb)
    for k,res in enumerate(RESULTS[1:]): s.write_formula(row,4+k,f'=COUNTIFS({KR("B")},$A{R},{KR("J")},"{res}")',sb)
    c0=4+len(RESULTS)-1
    s.write_formula(row,c0,f'=SUMPRODUCT((MID({TR("都道府県名")},3,4)=$A{R})*{TR("架電回数")})',sb)
    for k,h in enumerate(CHK): s.write_formula(row,c0+1+k,f'=SUMPRODUCT((MID({TR("都道府県名")},3,4)=$A{R})*({TR(h)}=TRUE))',sb)
tr=3+len(prefs); tot=fmt(bold=True,bg_color='#DDEBF7',**B)
s.write(tr,0,'合計',tot)
for c in range(1,len(SH)): s.write_formula(tr,c,f'=SUM({CN(c)}4:{CN(c)}{tr})',tot)
s.freeze_panes(3,1)

# ---------- 4. 使い方・注意事項 ----------
n=wb.add_worksheet('使い方・注意事項'); n.set_column(0,0,120)
notes=['■ テレアポ管理（私立全国版）の使い方（DXハイスクール テレアポKPIシートと同じ書式）',
'・資料送付／商談希望／ピック／受注済／提案NG はチェックボックスです。セルをクリックするとチェックが入ります（受注済＝緑、商談希望＝黄、提案NG・受付NG・担当者NG＝グレーで行が自動着色）。',
'・架電ごとに「架電回数」を1増やし、「テレアポ1：日付」に最新の架電日、「架電最新結果」にプルダウンで結果を入力してください。',
'・「テレアポ1：詳細」は1回の架電につき1行、新しいものを上に「2026/10/07担当退勤」のように 日付＋内容 で追記します（改行は Alt＋Enter）。',
'・担当の先生と話せた場合は「取得情報」に 氏名（フリガナ）・メールアドレス・資料送付先住所 を記入してください。',
'・「新規継続」「偏差値帯」はプルダウン、「偏差値」は数値で入力します。「学校設置者名」（学校法人名）は分かった時点で記入してください。',
'・「担当者」には架電を担当した方（チーム名・氏名）を入力してください。',
'・チェックボックスはExcel（Microsoft 365）の機能です。古いExcelではTRUE／FALSEと表示されます。Googleスプレッドシートに取り込む場合は、該当列を選んで［挿入］→［チェックボックス］を設定してください。',
'',
'■ 架電リストの使い方',
'・「架電リスト」の黄色の列（電話番号・架電日・担当者・架電結果・次回連絡日・メモ）に入力してください。架電結果はプルダウンから選択します（アポ獲得＝緑、NG＝グレー）。',
'・「学校情報ページ」の「開く」をクリックすると、学校ネットの各校ページが開きます。',
'・「番号の確度」：高＝公式サイト、または2つ以上の情報源で一致／中＝公式未確認で第三者サイトのみ、または代表番号と断定できず（補足欄参照）／要調査＝特定できず・閉校など。',
'・「電話番号の補足」に、代表番号の共有・別番号（入試広報・通信制課程など）・移転・校名変更・募集停止などの注意を記載しています。架電前にご確認ください。',
'・「都道府県別集計」は両シートの入力に連動して自動で集計されます。',
'',
'■ 元データについての注意',
f'・出典：ご提供いただいた学校ネットの検索結果（私立高校・{region}、{N}校）の貼り付けデータ。並び順は都道府県コード順、各都道府県内は元データの掲載順です。',
'・電話番号は元データに記載がないため、2026年10月にWeb検索（学校公式サイト、都道府県・市町村・私学協会の資料、学校情報サイトなど）で調査しました。推測による補完はしていません。',
'・通信制（広域通信制）の学校は、所在地・電話番号とも本校のものです。架電先（本校／各キャンパス）にご注意ください。']
for i,x in enumerate(notes): n.write(i,0,x,fmt(bold=x.startswith('■'),font_size=11 if x.startswith('■') else 10,valign='top'))
wb.close()
print(N)
