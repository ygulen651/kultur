import { Target, Globe, FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Section } from "./Section"

const values = [
  {
    icon: Target,
    title: "MİSYONUMUZ",
    description: "Kamu emekçilerinin ekonomik, sosyal hak ve menfaatlerini korumak, çalışma koşullarının iyileştirilmesini sağlamak, iş güvencesinin teminat altına alınmasını sağlamak, iş sağlığı ve güvenliğinin artırılmasını ve sosyo- ekonomik, haklarının geliştirilmesini ve korunmasını sağlamak. Ülkemizin kültür, sanat ve turizm politikalarının gelişimine katkıda bulunmak, ve örgütlenerek toplumsal bilincin gelişmesine katkıda bulunmak.",
    color: "text-blue-600"
  },
  {
    icon: Globe,
    title: "VİZYONUMUZ", 
    description: "Büyük Önder Ulu Atatürk'ün önderliğinde kurulan Atatürk Milliyetçiliğine bağlı, insan hak ve hukukuna saygılı Laik, Demokratik ve Sosyal Türkiye Cumhuriyeti Devletinin bütünlüğünü, ulusumuzun tam bağımsızlığını, Çağdaşlığını, Demokrasisini ve Hukuk'unu geliştirerek korumak ve gelecek kuşaklara aydınlık yarınlar bırakmak.",
    color: "text-green-600"
  },
  {
    icon: FileText,
    title: "AMACI",
    description: "Taşeronlaşmaya, Angaryaya ve hukuk dışı çalıştırılmaya karşı durarak, kamu emekçilerinin ortak ekonomik, sosyal, kültürel mesleki ve özlük haklarını korumak, geliştirmek, çalışma ve toplumsal barışının sağlanabilmesi için çalışmalar yapmak, kadın çalışanlarımız ile engelli olarak çalışanların sorunlarına çözüm üretmek, sendikal yaşamın hayata geçirilebilmesi için örgütlü çalışmalar yapmak, Ülkemizin laik, demokratik ve sosyal hukuk devleti yapısını korumak ve geliştirmek.",
    color: "text-purple-600"
  }
]

export function MissionVisionValues() {
  return (
    <Section background="muted" padding="xl">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Hakkımızda
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Güçlü değerlerimiz ve net hedeflerimizle çalışan haklarını koruyoruz
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {values.map((item, index) => (
          <Card key={index} className="text-center h-full hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="pb-4">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <item.icon className={`h-8 w-8 ${item.color}`} />
              </div>
              <CardTitle className="text-xl">{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  )
}
