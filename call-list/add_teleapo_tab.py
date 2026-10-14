# 全体リストに「テレアポ管理シート」形式（DXハイスクール テレアポKPIシートの書式）のタブを追加する
# usage: python3 add_teleapo_tab.py <schools.tsv> <phones.tsv> <target.xlsx>
import sys, csv, re
from openpyxl import load_workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.formatting.rule import FormulaRule
from openpyxl.utils import get_column_letter as L
src, phf, target = sys.argv[1:4]
PREFS='北海道 青森県 岩手県 宮城県 秋田県 山形県 福島県 茨城県 栃木県 群馬県 埼玉県 千葉県 東京都 神奈川県 新潟県 富山県 石川県 福井県 山梨県 長野県 岐阜県 静岡県 愛知県 三重県 滋賀県 京都府 大阪府 兵庫県 奈良県 和歌山県 鳥取県 島根県 岡山県 広島県 山口県 徳島県 香川県 愛媛県 高知県 福岡県 佐賀県 長崎県 熊本県 大分県 宮崎県 鹿児島県 沖縄県'.split()
phones={}
for row in csv.reader(open(phf,encoding='utf-8'),delimiter='\t'):
    row+=['']*(6-len(row)); no,nm,tel,conf,url,memo=row[:6]; phones[int(no)]=dict(tel=tel,conf=conf,memo=memo)
recs=[]
for name,addr,sid,course in csv.reader(open(src,encoding='utf-8'),delimiter='\t'):
    p=re.match(r'(北海道|東京都|(?:京都|大阪)府|.{2,3}県)',addr).group(1)
    recs.append(dict(name=name,pref=p,code=f'{PREFS.index(p)+1:02d}{p}',course=course,url=f'https://www.gakkou.net/kou/view/index_{sid}.html'))

wb=load_workbook(target)
TITLE='テレアポ管理（私立全国版）'
if TITLE in wb.sheetnames: del wb[TITLE]
ws=wb.create_sheet(TITLE,1)
F='Yu Gothic'
f=lambda **k:Font(name=F,size=k.pop('size',10),**k)
grid=Side(style='thin',color='D9D9D9'); blk=Side(style='thin',color='000000'); thick=Side(style='medium',color='000000')
G=Border(left=grid,right=grid,top=grid,bottom=grid)
CYAN=PatternFill('solid',fgColor='00FFFF')
CHK=['資料送付','商談希望','ピック','受注済','提案NG']
H=['都道府県名','公私','学校設置者名','学校名','電話番号','新規継続','学科']+CHK+['偏差値帯','架電回数','テレアポ1：日付','架電最新結果','テレアポ1：詳細','取得情報（担当先生、メールアドレス、住所）','担当者','偏差値','番号の確度','電話番号の補足','学校情報ページ']
W=[11,9,18,34,15,10,16,7,7,7,7,7,15,8,11,13,50,30,10,7,8,40,11]
hr=5; last=hr+len(recs)
ws['B2']='DXハイスクール テレアポ架電優先順位・運用ルール（私立高校 全国版）'; ws['B2'].font=f(color='1155CC',underline='single')
ws['B3']=f'私立高校 全国47都道府県／{len(recs)}校。電話番号は2026年10月にWeb検索で調査（確度・補足はU〜V列）。☐の列はプルダウンで☑に切り替えてください。'; ws['B3'].font=f(size=9,color='595959')
for c,(h,w) in enumerate(zip(H,W),1):
    x=ws.cell(hr,c,h); x.font=f(bold=True,size=9 if h in CHK else 10); x.fill=CYAN
    x.alignment=Alignment(horizontal='center' if h in CHK else 'left',vertical='center'); x.border=Border(left=grid,right=grid,top=grid,bottom=thick)
    ws.column_dimensions[L(c)].width=w
ws.row_dimensions[hr].height=20
CI={h:i+1 for i,h in enumerate(H)}
CONF={'高':'C6EFCE','中':'FFEB9C','要調査':'FFC7CE'}
for n,r in enumerate(recs,1):
    row=hr+n; ph=phones.get(n,{})
    tel=ph.get('tel') or None; conf=ph.get('conf') if tel else '要調査'
    vals={'都道府県名':r['code'],'公私':'私立','学校名':r['name'],'電話番号':tel,'学科':r['course'] or None,'架電回数':0,
          '番号の確度':conf,'電話番号の補足':ph.get('memo') or None,'学校情報ページ':'開く'}
    for h in CHK: vals[h]='☐'
    for h,c in CI.items():
        x=ws.cell(row,c,vals.get(h)); x.font=f(); x.border=G
        x.alignment=Alignment(vertical='bottom',wrap_text=h in('テレアポ1：詳細','取得情報（担当先生、メールアドレス、住所）','電話番号の補足'))
    # 参考シート同様：学科・偏差値帯は上寄せ、チェック列は中央、学科〜提案NGと偏差値帯を黒枠で区切る
    for h in ('学科','偏差値帯'): ws.cell(row,CI[h]).alignment=Alignment(vertical='top',wrap_text=True)
    for h in CHK: ws.cell(row,CI[h]).alignment=Alignment(horizontal='center',vertical='bottom'); ws.cell(row,CI[h]).font=f(size=12,color='808080')
    for h in ('架電回数','テレアポ1：日付'): ws.cell(row,CI[h]).alignment=Alignment(horizontal='right',vertical='bottom')
    ws.cell(row,CI['偏差値']).alignment=Alignment(horizontal='center',vertical='center')
    ws.cell(row,CI['学科']).border=Border(left=blk,right=blk,top=blk,bottom=blk)
    ws.cell(row,CI['偏差値帯']).border=Border(left=blk,right=blk,top=blk,bottom=blk)
    ws.cell(row,CI['偏差値']).border=Border(left=blk,right=blk,top=blk,bottom=blk)
    ws.cell(row,CI['電話番号']).number_format='@'
    ws.cell(row,CI['テレアポ1：日付']).number_format='m/d'
    cx=ws.cell(row,CI['番号の確度']); cx.alignment=Alignment(horizontal='center',vertical='bottom')
    if conf in CONF: cx.fill=PatternFill('solid',fgColor=CONF[conf])
    ws.cell(row,CI['電話番号の補足']).font=f(size=9)
    l=ws.cell(row,CI['学校情報ページ']); l.hyperlink=r['url']; l.font=f(color='0563C1',underline='single'); l.alignment=Alignment(horizontal='center',vertical='bottom')
    ws.row_dimensions[row].height=30
ws.freeze_panes=f'E{hr+1}'
ws.auto_filter.ref=f'A{hr}:{L(len(H))}{last}'
rng=lambda h:f'{L(CI[h])}{hr+1}:{L(CI[h])}{last}'
def dv(items,*hs,blank=True):
    d=DataValidation(type='list',formula1='"'+','.join(items)+'"',allow_blank=blank); ws.add_data_validation(d)
    for h in hs: d.add(rng(h))
dv(['☐','☑'],*CHK)
dv(['新規','継続'],'新規継続')
dv(['進学校（60以上）','中堅（45〜59）','中堅以下（44以下）'],'偏差値帯')
dv(['担当不在','受付NG','担当者NG','資料送付','商談希望','不通','受付時間外','番号不明'],'架電最新結果')
dd=DataValidation(type='date',operator='greaterThan',formula1='36526',allow_blank=True,errorTitle='日付',error='日付で入力してください（例：10/7）'); ws.add_data_validation(dd); dd.add(rng('テレアポ1：日付'))
dn=DataValidation(type='whole',operator='greaterThanOrEqual',formula1='0',allow_blank=True); ws.add_data_validation(dn); dn.add(rng('架電回数'))
A=f'A{hr+1}:{L(len(H))}{last}'; r0=hr+1
ws.conditional_formatting.add(A,FormulaRule(formula=[f'${L(CI["受注済"])}{r0}="☑"'],fill=PatternFill('solid',fgColor='C6EFCE')))
ws.conditional_formatting.add(A,FormulaRule(formula=[f'${L(CI["商談希望"])}{r0}="☑"'],fill=PatternFill('solid',fgColor='FFF2CC')))
ws.conditional_formatting.add(A,FormulaRule(formula=[f'OR(${L(CI["提案NG"])}{r0}="☑",${L(CI["架電最新結果"])}{r0}="受付NG",${L(CI["架電最新結果"])}{r0}="担当者NG")'],fill=PatternFill('solid',fgColor='A6A6A6')))
ws.print_title_rows=f'{hr}:{hr}'; ws.page_setup.orientation='landscape'; ws.page_setup.paperSize=ws.PAPERSIZE_A4
ws.page_setup.fitToWidth=1; ws.page_setup.fitToHeight=0; ws.sheet_properties.pageSetUpPr.fitToPage=True
ws.sheet_view.showGridLines=True
wb.save(target)
print(len(recs))
