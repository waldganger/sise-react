import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.css';
import './index.css';
// import App from './App';
import reportWebVitals from './reportWebVitals';


function fte(data){
    return Object.values(data).map(el => el.fields.effectif).reduce((sum, curr) => sum + curr, 0);
}

function listeFields(data){
    let set = new Set();
    for(let el of Object.values(data)){
        for (let f of Object.keys(el.fields)){
            set.add(f);
        }
    }
    return Array.from(set);
}

function listeDisciplines(data){
    let set = new Set();
    Object.values(data).map(el => set.add(el.fields.sect_disciplinaire_lib));
    return Array.from(set);
}

function listeSite(data) {
    let set = new Set();
    Object.values(data).map(el => set.add(el.fields.com_ins_lib));
    return Array.from(set);
}

function listeAllPropertiesValues(data){        
    let resultat = {};
    listeFields(data).map(prop => resultat[prop] = listePropertyValues(data, String(prop)));
    return resultat;
}

function listePropertyValues(data, property){
    let set = new Set();
    Object.values(data).map(el => set.add(el.fields[property]));
    return Array.from(set);
}

function fteDiscipline(data, disc){
    return Object.values(data).filter(el => el.fields.sect_disciplinaire_lib == disc)
    .map(el => el.fields.effectif)
    .reduce((sum, current) => sum + current, 0);
}

function printFteByDiscipline(data){
    console.table(
        listeDisciplines(data).map(disc => {
            return {
                "Discipline": disc,
                "FTE": fteDiscipline(data, disc)
            };
        }));
}

function totalFte(data){
    return listeDisciplines(data).map(disc => fteDiscipline(data, disc)).reduce((sum, current) => sum + current, 0);
}

// REACT
class Sise extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data : [],
      err: null,
      isLoading: false
    }
  }

  componentDidMount() {
    this.setState({isLoading: true});
    const url = "https://data.enseignementsup-recherche.gouv.fr/api/records/1.0/search/?dataset=fr-esr-sise-effectifs-d-etudiants-inscrits-esr-public&q=&rows=4841&facet=rentree_lib&facet=etablissement_type2&facet=etablissement_type_lib&facet=etablissement_lib&facet=identifiant_eter&facet=champ_statistique&facet=operateur_lib&facet=localisation_etab&facet=localisation_ins&facet=bac_lib&facet=attrac_intern_lib&facet=dn_de_lib&facet=cursus_lmd_lib&facet=diplome_lib&facet=niveau_lib&facet=disciplines_selection&facet=gd_disciscipline_lib&facet=discipline_lib&facet=sect_disciplinaire_lib&facet=reg_etab_lib&facet=com_ins_lib&facet=uucr_ins_lib&facet=dep_ins_lib&facet=aca_ins_lib&facet=reg_ins_lib&refine.rentree_lib=2018-19&refine.etablissement_lib=Universit%C3%A9+de+Pau+et+des+Pays+de+l%27Adour";
    fetch(url)
    .then(res => {
      if (res >= 400) {
        throw new Error("Le serveur a renvoyé une erreur :-/");
      }
      return res.json();
    })
    .then(objet => {
      console.log(objet);
      this.setState({
        data : objet.records,
        isLoading: false
      })
    })
  }

  render() {
    const {data, err, isLoading} = this.state;
    if (err) return (<div>{err.message}</div>);
    if (isLoading) return (<div>Chargement des données SISE en cours, veuillez patienter.</div>);

    return(
      <div>
        <h2>Nombre total de FTE : {totalFte(data)} </h2>
        <TableauDisciplinesEffectifs data={data}/>
      </div>
    )
  }

}

function Title(props) {
  return <h1>Statistiques SISE UPPA 2019</h1>
}

function TableauDisciplinesEffectifs(props) {
  return (
    <table className="table table-striped">
      <thead>
        <tr>
          <th>Discipline</th>
          <th>FTE</th>
        </tr>
        {listeDisciplines(props.data).map(disc => {
          return(
            <tr><td>{disc}</td><td>{fteDiscipline(props.data, disc)}</td></tr>
          )
        })}
      </thead>
    </table>
  )
}

ReactDOM.render(
  <React.StrictMode>
    <main>
      <Title/>
      <Sise />
    </main>

  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
